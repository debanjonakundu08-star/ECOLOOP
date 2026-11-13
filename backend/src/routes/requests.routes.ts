import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const requestsRouter = Router();

// POST submit a purchase request
requestsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId, quantity, offeredPrice, pickupMethod, message } = req.body;

    if (!materialId || !quantity || offeredPrice === undefined || !pickupMethod) {
      res.status(400).json({ error: 'Please specify material, quantity, offered price, and pickup method.' });
      return;
    }

    const material = await prisma.materialListing.findUnique({
      where: { id: materialId },
      include: { seller: true },
    });

    if (!material) {
      res.status(404).json({ error: 'Material listing not found.' });
      return;
    }

    if (material.sellerId === req.user!.id) {
      res.status(400).json({ error: 'You cannot request your own listed material.' });
      return;
    }

    if (parseFloat(quantity) > material.quantity) {
      res.status(400).json({
        error: `Requested quantity exceeds available stock (${material.quantity} ${material.unit}).`,
      });
      return;
    }

    if (parseFloat(quantity) < material.minOrderQuantity) {
      res.status(400).json({
        error: `Requested quantity is below minimum order quantity (${material.minOrderQuantity} ${material.unit}).`,
      });
      return;
    }

    const request = await prisma.materialRequest.create({
      data: {
        materialId,
        buyerId: req.user!.id,
        sellerId: material.sellerId,
        quantity: parseFloat(quantity),
        offeredPrice: parseFloat(offeredPrice),
        pickupMethod,
        message: message ? message.trim() : 'We are interested in purchasing this material.',
        status: 'PENDING',
      },
      include: {
        material: true,
        buyer: { select: { id: true, businessName: true, city: true, phone: true } },
      },
    });

    // Create or find conversation linked to this material, buyer, and seller
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              { participant1Id: req.user!.id, participant2Id: material.sellerId },
              { participant1Id: material.sellerId, participant2Id: req.user!.id },
            ],
          },
          { materialId: material.id },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId: req.user!.id,
          sellerId: material.sellerId,
          participant1Id: req.user!.id,
          participant2Id: material.sellerId,
          materialId: material.id,
          requestId: request.id,
          lastMessage: `Purchase Request for ${material.title}: ${quantity} ${material.unit} at ₹${offeredPrice}/${material.unit}`,
          lastMessageAt: new Date(),
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          buyerId: req.user!.id,
          sellerId: material.sellerId,
          requestId: request.id,
          lastMessage: `Purchase Request for ${material.title}: ${quantity} ${material.unit} at ₹${offeredPrice}/${material.unit}`,
          lastMessageAt: new Date(),
        },
      });
    }

    // Insert message into conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user!.id,
        receiverId: material.sellerId,
        content: `New Buyer Request:\n• Company Name: ${req.user!.businessName}\n• Interested In: ${material.title}\n• Category: ${material.category}\n• Quantity: ${quantity} ${material.unit}\n• Offered Rate: ₹${offeredPrice}/${material.unit}\n• Pickup Method: ${pickupMethod}\n• Message: "${message ? message.trim() : 'We are interested in purchasing this material.'}"`,
        isNegotiation: true,
        proposedPrice: parseFloat(offeredPrice),
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: material.sellerId,
        title: 'New Buyer Request',
        message: `Company: ${req.user!.businessName}\nInterested In: ${material.title}\nCategory: ${material.category}\nMessage: ${message ? message.trim() : 'We are interested in purchasing this material.'}\nOffered Rate: ₹${offeredPrice}/${material.unit} (${quantity} ${material.unit})`,
        type: 'REQUEST',
        link: `/messages?conversationId=${conversation.id}`,
      },
    });

    res.status(201).json({
      message: 'Purchase request sent to seller successfully.',
      request,
    });
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({ error: 'Failed to submit purchase request.' });
  }
});

// GET seller's received requests
requestsRouter.get('/seller', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.materialRequest.findMany({
      where: { sellerId: req.user!.id },
      include: {
        material: {
          include: { images: true },
        },
        buyer: {
          select: {
            id: true,
            businessName: true,
            email: true,
            phone: true,
            city: true,
            category: true,
            isVerified: true,
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seller requests.' });
  }
});

// GET buyer's sent requests
requestsRouter.get('/buyer', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.materialRequest.findMany({
      where: { buyerId: req.user!.id },
      include: {
        material: {
          include: { images: true },
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            city: true,
            phone: true,
            category: true,
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch buyer requests.' });
  }
});

// PUT update request status (Accept, Decline, Negotiate)
requestsRouter.put('/:id/status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, counterPrice, counterNotes } = req.body;

    const request = await prisma.materialRequest.findUnique({
      where: { id: req.params.id },
      include: {
        material: true,
        buyer: true,
        seller: true,
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Request not found.' });
      return;
    }

    // Only seller or buyer can act on request
    const isSeller = request.sellerId === req.user!.id;
    const isBuyer = request.buyerId === req.user!.id;

    if (!isSeller && !isBuyer) {
      res.status(403).json({ error: 'Unauthorized to update this request.' });
      return;
    }

    const updatedRequest = await prisma.materialRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        counterPrice: counterPrice !== undefined ? parseFloat(counterPrice) : request.counterPrice,
        counterNotes: counterNotes !== undefined ? counterNotes : request.counterNotes,
      },
      include: {
        material: true,
        buyer: true,
        seller: true,
      },
    });

    // If accepted by seller, automatically create an Order record ready for payment
    let createdOrder = null;
    if (status === 'ACCEPTED' && isSeller) {
      const finalPrice = updatedRequest.counterPrice || updatedRequest.offeredPrice;
      const baseAmount = updatedRequest.quantity * finalPrice;
      const platformFee = Math.round(baseAmount * 0.03 * 100) / 100; // 3% fee
      const logisticsFee = updatedRequest.pickupMethod === 'EcoLoop Logistics' ? 450 : 0;
      const totalAmount = baseAmount + platformFee + logisticsFee;
      const orderNumber = `ECL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Check if order already created
      const existingOrder = await prisma.order.findFirst({
        where: { requestId: request.id },
      });

      if (!existingOrder) {
        createdOrder = await prisma.order.create({
          data: {
            orderNumber,
            requestId: request.id,
            materialId: request.materialId,
            buyerId: request.buyerId,
            sellerId: request.sellerId,
            quantity: request.quantity,
            unitPrice: finalPrice,
            baseAmount,
            platformFee,
            logisticsFee,
            totalAmount,
            pickupMethod: request.pickupMethod,
            shippingAddress: request.buyer.address || `${request.buyer.city}, India`,
            paymentStatus: 'PENDING',
            deliveryStatus: 'PROCESSING',
          },
        });
      }

      // Notify buyer
      await prisma.notification.create({
        data: {
          userId: request.buyerId,
          title: 'Request Accepted!',
          message: `${request.seller.businessName} accepted your request for ${request.material.title}. Order #${orderNumber} created. Proceed to payment.`,
          type: 'ORDER',
          link: createdOrder ? `/orders/${createdOrder.id}` : '/orders',
        },
      });
    } else if (status === 'DECLINED') {
      await prisma.notification.create({
        data: {
          userId: request.buyerId,
          title: 'Request Declined',
          message: `${request.seller.businessName} declined the request for ${request.material.title}.`,
          type: 'REQUEST',
          link: '/marketplace',
        },
      });
    } else if (status === 'NEGOTIATING') {
      const targetUserId = isSeller ? request.buyerId : request.sellerId;
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Counter-Offer Received',
          message: `${req.user!.businessName} counter-offered ₹${counterPrice}/${request.material.unit}: "${counterNotes || 'Proposed adjusted terms'}"`,
          type: 'OFFER',
          link: '/messages',
        },
      });

      // Also log into chat conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { buyerId: request.buyerId, sellerId: request.sellerId },
            { participant1Id: request.buyerId, participant2Id: request.sellerId },
            { participant1Id: request.sellerId, participant2Id: request.buyerId },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId: request.buyerId,
            sellerId: request.sellerId,
            participant1Id: request.buyerId,
            participant2Id: request.sellerId,
            materialId: request.materialId,
            requestId: request.id,
            lastMessage: `Counter-offer: Proposed ₹${counterPrice}/${request.material.unit}`,
            lastMessageAt: new Date(),
          },
        });
      } else if (!conversation.buyerId || !conversation.sellerId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { buyerId: request.buyerId, sellerId: request.sellerId },
        });
      }

      const counterReceiverId = isSeller ? request.buyerId : request.sellerId;
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.id,
          receiverId: counterReceiverId,
          content: `Counter-offer: Proposed ₹${counterPrice}/${request.material.unit}. Note: ${counterNotes || 'Let\'s finalize this rate.'}`,
          isNegotiation: true,
          proposedPrice: parseFloat(counterPrice),
        },
      });
    }

    res.json({
      message: `Request status updated to ${status}.`,
      request: updatedRequest,
      order: createdOrder,
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status.' });
  }
});

// DELETE undo / cancel pending purchase offer
requestsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id;
    const userId = req.user!.id;

    const request = await prisma.materialRequest.findUnique({
      where: { id: requestId },
      include: {
        material: true,
        seller: true,
        orders: true,
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Purchase offer not found.' });
      return;
    }

    if (request.buyerId !== userId) {
      res.status(403).json({ error: 'Unauthorized: You can only undo your own purchase offers.' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({
        error: `Cannot undo an offer with status "${request.status}". Only PENDING offers can be cancelled.`,
      });
      return;
    }

    // Clean up notifications pointing to this request
    await prisma.notification.deleteMany({
      where: {
        link: { contains: requestId },
      },
    }).catch(() => {});

    // Notify seller that the offer was withdrawn
    await prisma.notification.create({
      data: {
        userId: request.sellerId,
        title: 'Offer Withdrawn by Buyer',
        message: `${req.user!.businessName} withdrew their pending purchase offer for ${request.material.title}.`,
        type: 'REQUEST',
        link: '/seller/requests',
      },
    }).catch(() => {});

    // Delete associated pending orders if any
    if (request.orders && request.orders.length > 0) {
      for (const ord of request.orders) {
        if (ord.paymentStatus !== 'PAID') {
          await prisma.order.delete({ where: { id: ord.id } }).catch(() => {});
        }
      }
    }

    // Delete the request record
    await prisma.materialRequest.delete({
      where: { id: requestId },
    });

    res.json({
      message: 'Pending purchase offer cancelled and removed successfully.',
      id: requestId,
    });
  } catch (error) {
    console.error('Undo request error:', error);
    res.status(500).json({ error: 'Failed to undo purchase offer.' });
  }
});

// PUT cancel route alias
requestsRouter.put('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id;
    const userId = req.user!.id;

    const request = await prisma.materialRequest.findUnique({
      where: { id: requestId },
      include: { material: true, seller: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Purchase offer not found.' });
      return;
    }

    if (request.buyerId !== userId) {
      res.status(403).json({ error: 'Unauthorized: You can only cancel your own purchase offers.' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending offers can be cancelled.' });
      return;
    }

    await prisma.materialRequest.delete({
      where: { id: requestId },
    });

    res.json({
      message: 'Purchase offer cancelled and removed.',
      id: requestId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel purchase offer.' });
  }
});
