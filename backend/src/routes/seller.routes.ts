import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const sellerRouter = Router();

// GET seller dashboard KPIs, charts, and recent activities
sellerRouter.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!.id;

    // 1. KPI Counts
    const totalListings = await prisma.materialListing.count({
      where: { sellerId },
    });

    const activeListingsCount = await prisma.materialListing.count({
      where: { sellerId, status: 'ACTIVE' },
    });

    const soldListingsCount = await prisma.materialListing.count({
      where: { sellerId, availability: 'SOLD' },
    });

    const availableListingsCount = await prisma.materialListing.count({
      where: { sellerId, availability: { not: 'SOLD' }, status: 'ACTIVE' },
    });

    const buyerEnquiriesCount = await prisma.materialRequest.count({
      where: { sellerId },
    });

    const pendingRequestsCount = await prisma.materialRequest.count({
      where: { sellerId, status: 'PENDING' },
    });

    const completedOrders = await prisma.order.findMany({
      where: { sellerId, paymentStatus: 'PAID' },
      select: {
        totalAmount: true,
        baseAmount: true,
        quantity: true,
        createdAt: true,
        material: { select: { category: true, title: true } },
      },
    });

    const completedSalesCount = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.baseAmount, 0);

    // 2. Recent buyer requests
    const recentRequests = await prisma.materialRequest.findMany({
      where: { sellerId },
      include: {
        material: { select: { id: true, title: true, category: true, unit: true, pricePerUnit: true } },
        buyer: { select: { id: true, businessName: true, city: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 2b. Seller Notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: sellerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadNotificationsCount = await prisma.notification.count({
      where: { userId: sellerId, isRead: false },
    });

    // 3. Recent listings
    const myListings = await prisma.materialListing.findMany({
      where: { sellerId },
      include: {
        images: { take: 1 },
        _count: { select: { requests: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // 4. Recent transactions
    const recentOrders = await prisma.order.findMany({
      where: { sellerId },
      include: {
        material: { select: { title: true, unit: true } },
        buyer: { select: { businessName: true, city: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 5. Monthly sales chart data (last 6 months aggregation)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { month: string; revenue: number; orders: number }> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      monthlyMap[key] = { month: key, revenue: 0, orders: 0 };
    }

    completedOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += o.baseAmount;
        monthlyMap[key].orders += 1;
      }
    });

    const monthlySales = Object.values(monthlyMap);

    // 6. Category revenue breakdown
    const categoryRevenueMap: Record<string, number> = {};
    completedOrders.forEach((o) => {
      const cat = o.material.category || 'General';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + o.baseAmount;
    });

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, value]) => ({
      name: category,
      value,
    }));

    res.json({
      kpis: {
        totalListings,
        activeListings: activeListingsCount,
        soldItems: soldListingsCount,
        availableItems: availableListingsCount,
        buyerEnquiries: buyerEnquiriesCount,
        pendingRequests: pendingRequestsCount,
        completedSales: completedSalesCount,
        totalRevenue: Math.round(totalRevenue),
      },
      recentRequests,
      notifications,
      unreadNotificationsCount,
      myListings,
      recentOrders,
      analytics: {
        monthlySales,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch seller dashboard data.' });
  }
});
