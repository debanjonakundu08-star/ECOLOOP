import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest, MaterialListing, Order, Notification } from '../types';
import { getCategoryFallbackImage, getListingPrimaryImage } from '../utils/categoryImages';
import {
  Boxes,
  Clock,
  CheckCircle2,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Package,
  Trash2,
  ExternalLink,
  Pencil,
  Store,
  Bell,
  MessageSquare,
  X,
  CheckCheck,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    kpis: {
      totalListings?: number;
      activeListings: number;
      availableItems?: number;
      soldItems?: number;
      buyerEnquiries?: number;
      pendingRequests: number;
      completedSales: number;
      totalRevenue: number;
    };
    recentRequests: MaterialRequest[];
    myListings: MaterialListing[];
    recentOrders: Order[];
    analytics: {
      monthlySales: Array<{ month: string; revenue: number; orders: number }>;
      categoryBreakdown: Array<{ name: string; value: number }>;
    };
    notifications?: Notification[];
    unreadNotificationsCount?: number;
  } | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [res, notifRes] = await Promise.all([
        api.seller.getDashboard(),
        api.notifications.getAll().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);
      setData(res);
      const notifs = notifRes.notifications?.length ? notifRes.notifications : (res.notifications || []);
      setNotifications(notifs);
      setUnreadCount(notifRes.unreadCount ?? res.unreadNotificationsCount ?? notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const parseNotification = (notif: Notification) => {
    const lines = (notif.message || '').split('\n');
    const map: Record<string, string> = {};
    let fallbackText = '';
    lines.forEach((line) => {
      const idx = line.indexOf(': ');
      if (idx !== -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 2).trim();
        map[k] = v;
      } else {
        fallbackText += (fallbackText ? ' ' : '') + line;
      }
    });
    return {
      companyName: map['Company'] || notif.title.replace('New Purchase Request from ', '').replace('New Message from ', '') || 'Verified Buyer',
      productName: map['Interested In'] || 'Material Listing',
      category: map['Category'] || 'Industrial Scrap',
      offeredRate: map['Offered Rate'] || null,
      messageText: map['Message'] || fallbackText || notif.message,
      status: notif.isRead ? 'Read' : 'New',
    };
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      if (!notif.isRead) {
        await api.notifications.markRead(notif.id).catch(() => {});
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      if (notif.link) {
        navigate(notif.link);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Failed to handle notification click:', err);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.materials.delete(listingId);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#14b8a6', '#2dd4bf'];

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center py-16 px-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Aggregating seller analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Quick Actions Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <Store className="w-3.5 h-3.5" />
                Seller Inventory Hub
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Waste Generator &amp; Merchant Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Seller Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Manage your active waste streams, review incoming bids from verified buyers, track sales fulfillment, and monetize industrial surplus.
            </p>
          </div>

          {/* Quick Seller Actions & Notification Bell */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => setShowNotificationPanel((prev) => !prev)}
              className={`relative px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer ${
                showNotificationPanel || unreadCount > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50'
                  : 'bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-emerald-900/60 hover:bg-slate-50'
              }`}
              title="Buyer Requests & Notifications"
            >
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Buyer Requests</span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {unreadCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-ecoDark-bg text-slate-500">
                  {notifications.length}
                </span>
              )}
            </button>

            <Link
              to="/seller/listings"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-900/60 hover:bg-slate-50 transition-all shadow-2xs text-center"
            >
              My Listings ({data.kpis.activeListings})
            </Link>
            <Link
              to="/seller/requests"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-900/60 hover:bg-slate-50 transition-all shadow-2xs text-center"
            >
              Incoming Bids ({data.kpis.pendingRequests})
            </Link>
            <Link
              to="/seller/list-waste"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-md whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Waste</span>
            </Link>
          </div>
        </div>

        {/* Dedicated Buyer Requests / Notification Panel */}
        {showNotificationPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-950/60 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Buyer Requests &amp; Notification Panel
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Incoming purchase enquiries and messages sent by interested buyers for your listed products.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-ecoDark-card transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors cursor-pointer"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No buyer enquiries yet
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  When a buyer requests to purchase or discusses your listed waste materials, real-time alerts will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.map((notif) => {
                  const parsed = parseNotification(notif);
                  return (
                    <div
                      key={notif.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        !notif.isRead
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50/60 dark:bg-ecoDark-card border-slate-200/80 dark:border-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {parsed.companyName}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            !notif.isRead
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {!notif.isRead ? 'New' : 'Read'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-ecoDark-surface/60 p-3 rounded-xl border border-slate-100 dark:border-emerald-950/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Interested In:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{parsed.productName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Category:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{parsed.category}</span>
                        </div>
                        {parsed.offeredRate && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold">Offered Rate:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{parsed.offeredRate}</span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-100 dark:border-emerald-950/60">
                          <span className="text-slate-400 font-semibold block text-[11px]">Message:</span>
                          <p className="text-xs text-slate-700 dark:text-slate-200 italic mt-0.5">"{parsed.messageText}"</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open &amp; Respond via Chat</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* 1. Required Seller KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Total Listed Items */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Listed</span>
              <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
              {data.kpis.totalListings ?? (data.kpis.activeListings + (data.kpis.soldItems || 0))}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
              All registered lots
            </div>
          </motion.div>

          {/* 2. Active Listings */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Listings</span>
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
              {data.kpis.activeListings}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Live in marketplace
            </div>
          </motion.div>

          {/* 3. Available Items */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Available Items</span>
              <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
              {data.kpis.availableItems ?? data.kpis.activeListings}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
              Ready for dispatch
            </div>
          </motion.div>

          {/* 4. Sold Items */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sold Items</span>
              <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
              {data.kpis.soldItems ?? data.kpis.completedSales}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              Fulfilled streams
            </div>
          </motion.div>

          {/* 5. Buyer Enquiries */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Buyer Enquiries</span>
              <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
              {data.kpis.buyerEnquiries ?? data.kpis.pendingRequests}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              Incoming bids &amp; chats
            </div>
          </motion.div>
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Monthly Circulated Value (₹)</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Aggregated revenue from completed listings</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.analytics.monthlySales}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#092117', borderRadius: '12px', borderColor: '#10b981', color: '#fff' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart (1 col) */}
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 flex flex-col justify-between transition-colors">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Revenue by Material Type</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Share of scrap proceeds</p>
            </div>

            <div className="h-56 w-full my-auto">
              {data.analytics.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.analytics.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Value']}
                      contentStyle={{ backgroundColor: '#092117', borderRadius: '12px', borderColor: '#10b981', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No closed sales recorded yet
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-emerald-950/60">
              {data.analytics.categoryBreakdown.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Recent Buyer Requests & Bids */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-950/60">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recent Purchase Requests</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Bids received from registered recycling facilities and manufacturers</p>
            </div>
            <Link
              to="/seller/requests"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Manage all bids</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.recentRequests.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No purchase requests received yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-emerald-950/60">
              {data.recentRequests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{req.buyer.businessName}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">({req.buyer.city})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' :
                        req.status === 'NEGOTIATING' ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' : 'bg-slate-100 dark:bg-ecoDark-card text-slate-600 dark:text-slate-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Material: <strong className="text-slate-800 dark:text-white">{req.material?.title}</strong> • Requested: <strong>{req.quantity} {req.material?.unit}</strong> at offered rate <strong>₹{req.offeredPrice}/{req.material?.unit}</strong>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">"{req.message}"</p>
                  </div>

                  <Link
                    to="/seller/requests"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-ecoDark-card hover:bg-emerald-50 dark:hover:bg-ecoDark-hover hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-200 transition-colors shrink-0 text-center"
                  >
                    Review Bid
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Active Listings Management Table */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-950/60">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Inventory Stock & Active Listings</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Overview of your published excess materials</p>
            </div>
            <Link
              to="/seller/add-listing"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <span>+ Add New Listing</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-ecoDark-card text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Material</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                {data.myListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/50 dark:hover:bg-ecoDark-card/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img
                        src={getListingPrimaryImage(listing)}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCategoryFallbackImage(listing.category, listing.title);
                        }}
                      />
                      <span className="truncate max-w-[200px]">{listing.title}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{listing.category}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{listing.quantity} {listing.unit}</td>
                    <td className="p-3 font-bold text-emerald-800 dark:text-emerald-400">₹{listing.pricePerUnit}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{listing.condition}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        listing.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/materials/${listing.id}`}
                        className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 inline-block transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/materials/${listing.id}/edit`}
                        className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 inline-block transition-colors"
                        title="Edit your listing"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 inline-block transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
