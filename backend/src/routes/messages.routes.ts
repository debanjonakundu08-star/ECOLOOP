import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const messagesRouter = Router();

// GET all conversations for current user (strictly scoped to buyerId or sellerId)
messagesRouter.get('/conversations', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const queryRole = (req.query.role as string)?.toUpperCase();
    const effectiveRole = queryRole === 'BUYER' || queryRole === 'SELLER' ? queryRole : userRole;

    // Strict participant query:
    // If Buyer: only conversations where buyerId === userId (or participant where not seller)
    // If Seller: only conversations where sellerId === userId (or participant where not buyer)
    let whereClause: any;
    if (effectiveRole === 'BUYER') {
      whereClause = {
        OR: [
          { buyerId: userId },
          { participant1Id: userId, sellerId: { not: userId } },
        ],
      };
    } else if (effectiveRole === 'SELLER') {
      whereClause = {
        OR: [
          { sellerId: userId },
          { participant2Id: userId, buyerId: { not: userId } },
        ],
      };
    } else {
      whereClause = {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      };
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        request: {
          include: {
            material: {
              include: { images: true },
            },
          },
        },
        material: {
          include: { images: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Populate and ensure buyerId/sellerId integrity
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        // Resolve other user ID
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            businessName: true,
            city: true,
            category: true,
            role: true,
            isVerified: true,
          },
        });

        // Determine buyerId and sellerId if missing
        let resolvedBuyerId = conv.buyerId;
        let resolvedSellerId = conv.sellerId;
        if (!resolvedBuyerId || !resolvedSellerId) {
          if (conv.request) {
            resolvedBuyerId = conv.request.buyerId;
            resolvedSellerId = conv.request.sellerId;
          } else if (conv.material) {
            resolvedSellerId = conv.material.sellerId;
            resolvedBuyerId = conv.participant1Id === conv.material.sellerId ? conv.participant2Id : conv.participant1Id;
          } else if (otherUser) {
            if (otherUser.role === 'SELLER') {
              resolvedSellerId = otherUserId;
              resolvedBuyerId = userId;
            } else {
              resolvedBuyerId = otherUserId;
              resolvedSellerId = userId;
            }
          }
        }

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: otherUserId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          buyerId: resolvedBuyerId,
          sellerId: resolvedSellerId,
          user1Id: conv.participant1Id,
          user2Id: conv.participant2Id,
          otherUser,
          lastMessage: conv.messages[0]?.content || conv.lastMessage || 'No messages yet',
          lastMessageAt: conv.messages[0]?.createdAt || conv.lastMessageAt,
          unreadCount,
          request: conv.request,
          material: conv.material || conv.request?.material,
        };
      })
    );

    res.json({ conversations: populated });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// GET messages in a conversation (with strict authorization guard)
messagesRouter.get('/conversation/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
      include: {
        request: {
          include: {
            material: { include: { images: true } },
          },
        },
        material: {
          include: { images: true },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    // Strict participant guard: only buyer or seller of this conversation can view
    const isParticipant =
      conversation.buyerId === userId ||
      conversation.sellerId === userId ||
      conversation.participant1Id === userId ||
      conversation.participant2Id === userId;

    if (!isParticipant) {
      res.status(403).json({ error: 'Access denied: You are not authorized to view this private conversation.' });
      return;
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: convId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, businessName: true, city: true, role: true },
        },
      },
    });

    const otherUserId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, businessName: true, city: true, category: true, role: true, isVerified: true },
    });

    res.json({
      conversation: {
        ...conversation,
        otherUser,
      },
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load messages.' });
  }
});

// POST send a message (with strict participant guard and buyer/seller scoping)
messagesRouter.post('/send', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, receiverId, content, isNegotiation, proposedPrice, materialId } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    let targetConvId = conversationId;

    if (targetConvId) {
      const existingConv = await prisma.conversation.findUnique({
        where: { id: targetConvId },
      });
      if (!existingConv) {
        res.status(404).json({ error: 'Conversation not found.' });
        return;
      }
      const isParticipant =
        existingConv.buyerId === userId ||
        existingConv.sellerId === userId ||
        existingConv.participant1Id === userId ||
        existingConv.participant2Id === userId;

      if (!isParticipant) {
        res.status(403).json({ error: 'Unauthorized: You are not a participant in this conversation.' });
        return;
      }
    } else if (receiverId) {
      let determinedSellerId: string | null = null;
      let determinedBuyerId: string | null = null;

      if (materialId) {
        const mat = await prisma.materialListing.findUnique({ where: { id: materialId } });
        if (mat) {
          determinedSellerId = mat.sellerId;
          determinedBuyerId = userId === mat.sellerId ? receiverId : userId;
        }
      }

      if (!determinedSellerId || !determinedBuyerId) {
        if (userRole === 'SELLER') {
          determinedSellerId = userId;
          determinedBuyerId = receiverId;
        } else {
          determinedBuyerId = userId;
          determinedSellerId = receiverId;
        }
      }

      // Find or create conversation for these participants
      let conv = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              OR: [
                { buyerId: determinedBuyerId, sellerId: determinedSellerId },
                { participant1Id: userId, participant2Id: receiverId },
                { participant1Id: receiverId, participant2Id: userId },
              ],
            },
            ...(materialId ? [{ materialId }] : []),
          ],
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            buyerId: determinedBuyerId,
            sellerId: determinedSellerId,
            participant1Id: userId,
            participant2Id: receiverId,
            materialId: materialId || null,
            lastMessage: content.trim(),
            lastMessageAt: new Date(),
          },
        });
      } else if (!conv.buyerId || !conv.sellerId) {
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { buyerId: determinedBuyerId, sellerId: determinedSellerId },
        });
      }
      targetConvId = conv.id;
    }

    if (!targetConvId) {
      res.status(400).json({ error: 'Please provide conversationId or receiverId.' });
      return;
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: targetConvId },
      include: {
        material: {
          select: { id: true, title: true, category: true },
        },
      },
    });

    if (!conv) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const recipientId = receiverId || (conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id);

    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: userId,
        receiverId: recipientId,
        content: content.trim(),
        isNegotiation: Boolean(isNegotiation),
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, businessName: true, city: true, role: true },
        },
      },
    });

    // Update conversation lastMessage & lastMessageAt
    await prisma.conversation.update({
      where: { id: targetConvId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    });

    // Notify recipient
    try {
      const senderName = req.user?.businessName || 'Business Partner';
      const materialTitle = conv.material?.title || 'Material';
      const materialCategory = conv.material?.category || 'Surplus';

      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: isNegotiation ? `New Price Negotiation from ${senderName}` : `New Message from ${senderName}`,
          message: `Company: ${senderName}\nInterested In: ${materialTitle}\nCategory: ${materialCategory}\nMessage: ${content.trim()}${proposedPrice ? `\nProposed Rate: ₹${proposedPrice}` : ''}`,
          type: isNegotiation ? 'OFFER' : 'MESSAGE',
          link: `/messages?conversationId=${targetConvId}`,
        },
      });
    } catch (notifErr) {
      console.error('Failed to create message notification:', notifErr);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});
