import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const ordersRouter = Router();

// GET all orders for the user (as buyer or seller) with filter
ordersRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, role } = req.query; // status: "ALL", "ACTIVE", "COMPLETED", "CANCELLED"

    const isBuyer = req.user!.role === 'BUYER';
    const isSeller = req.user!.role === 'SELLER';

    let where: any = {};
    if (isBuyer || role === 'buyer') {
      where.buyerId = userId;
    } else if (isSeller || role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [
        { buyerId: userId },
        { sellerId: userId },
      ];
    }

    if (status === 'ACTIVE') {
      where.deliveryStatus = { in: ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT'] };
    } else if (status === 'COMPLETED') {
      where.deliveryStatus = 'DELIVERED';
    } else if (status === 'CANCELLED') {
      where.deliveryStatus = 'CANCELLED';
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        material: {
          include: { images: true },
        },
        buyer: {
          select: { id: true, businessName: true, city: true, phone: true, email: true },
        },
        seller: {
          select: { id: true, businessName: true, city: true, phone: true, email: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET single order details
ordersRouter.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        material: {
          include: { images: true },
        },
        buyer: {
          select: {
            id: true,
            businessName: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            category: true,
          },
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            category: true,
          },
        },
        payment: true,
        impactRecord: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      res.status(403).json({ error: 'Unauthorized to view this order.' });
      return;
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// PUT update order delivery status (seller or admin)
ordersRouter.put('/:id/delivery-status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deliveryStatus, trackingNotes } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { buyer: true, seller: true, material: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.sellerId !== userId && order.buyerId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update order delivery status.' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        deliveryStatus,
        trackingNotes: trackingNotes !== undefined ? trackingNotes : order.trackingNotes,
      },
      include: {
        material: true,
        buyer: true,
        seller: true,
        payment: true,
      },
    });

    // Notify buyer or seller
    const notifyUserId = order.sellerId === userId ? order.buyerId : order.sellerId;
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        title: `Order Status: ${deliveryStatus}`,
        message: `Order #${order.orderNumber} for ${order.material.title} is now ${deliveryStatus}.`,
        type: 'ORDER',
        link: `/orders/${order.id}`,
      },
    });

    res.json({ message: 'Delivery status updated successfully.', order: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// DELETE or CANCEL pending/unpaid order
ordersRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this order.' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      res.status(400).json({ error: 'Paid orders cannot be deleted. Please contact dispute support.' });
      return;
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.json({ message: 'Pending order removed successfully.', id: orderId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// PUT cancel order
ordersRouter.put('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      res.status(403).json({ error: 'Unauthorized to cancel this order.' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      res.status(400).json({ error: 'Paid orders cannot be cancelled directly.' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: 'CANCELLED',
      },
    });

    res.json({ message: 'Order cancelled successfully.', order: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});
