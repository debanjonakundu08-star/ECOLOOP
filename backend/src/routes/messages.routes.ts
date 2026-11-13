import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const messagesRouter = Router();

// GET all conversations for current user
messagesRouter.get('/conversations', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
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

    // Populate the other participant's details
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            businessName: true,
            city: true,
            category: true,
            isVerified: true,
          },
        });

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

// GET messages in a conversation
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

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      res.status(403).json({ error: 'Unauthorized to view this conversation.' });
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
          select: { id: true, businessName: true, city: true },
        },
      },
    });

    const otherUserId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, businessName: true, city: true, category: true, isVerified: true },
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

// POST send a message
messagesRouter.post('/send', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, receiverId, content, isNegotiation, proposedPrice, materialId } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    let targetConvId = conversationId;

    if (!targetConvId && receiverId) {
      // Find or create conversation for these participants (and this material if specified)
      let conv = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              OR: [
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
            participant1Id: userId,
            participant2Id: receiverId,
            materialId: materialId || null,
            lastMessage: content.trim(),
            lastMessageAt: new Date(),
          },
        });
      }
      targetConvId = conv.id;
    }

    if (!targetConvId) {
      res.status(400).json({ error: 'Please provide conversationId or receiverId.' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: userId,
        content: content.trim(),
        isNegotiation: Boolean(isNegotiation),
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, businessName: true, city: true },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: targetConvId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    });

    // Notify the other participant
    try {
      const conv = await prisma.conversation.findUnique({
        where: { id: targetConvId },
        include: {
          material: {
            select: { id: true, title: true, category: true },
          },
        },
      });

      if (conv) {
        const recipientId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
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
      }
    } catch (notifErr) {
      console.error('Failed to create message notification:', notifErr);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});
