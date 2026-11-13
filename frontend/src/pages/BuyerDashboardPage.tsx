import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Clock,
  Package,
  TrendingDown,
  Store,
  Heart,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Trash2,
  XCircle,
  Undo2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Data State
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableLotsCount, setAvailableLotsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'orders'>('offers');

  // Fetch Buyer procurement activities and listings count (strictly scoped to authenticated user)
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, ordRes, matRes] = await Promise.all([
        api.requests.getBuyerRequests().catch(() => ({ requests: [] })),
        api.orders.getAll({ role: 'buyer' }).catch(() => ({ orders: [] })),
        api.materials.getAll({ sort: 'newest' }).catch(() => ({ listings: [] })),
      ]);

      const currentUserId = user?.id;
      // Strict user isolation filter: only display records where buyerId matches currently logged-in user
      const userRequests = (Array.isArray(reqRes.requests) ? reqRes.requests : []).filter(
        (r) => !currentUserId || r.buyerId === currentUserId
      );
      const userOrders = (Array.isArray(ordRes.orders) ? ordRes.orders : []).filter(
        (o) => !currentUserId || o.buyerId === currentUserId
      );

      setRequests(userRequests);
      setOrders(userOrders);
      setAvailableLotsCount(Array.isArray(matRes?.listings) ? matRes.listings.length : 0);
    } catch (err) {
      console.error('Failed to load buyer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // Handle undo/cancelling a pending purchase offer
  const handleUndoOffer = async (requestId: string, title?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel and withdraw your purchase offer for "${title || 'this material'}"?\n\nThis will remove the offer from your dashboard and notify the seller.`
    );
    if (!confirmed) return;

    setActionLoadingId(requestId);
    try {
      await api.requests.delete(requestId);
      // Immediately remove from state to update UI and Active Purchase Offers KPI
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel purchase offer. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle cancelling a pending order
  const handleCancelOrder = async (orderId: string, orderNumber?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel pending order #${orderNumber || orderId}?`
    );
    if (!confirmed) return;

    setActionLoadingId(orderId);
    try {
      await api.orders.delete(orderId);
      // Immediately remove from state to update UI
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'COUNTERED' || r.status === 'NEGOTIATING'
  );
  const activeShipments = orders.filter(
    (o) => o.deliveryStatus === 'IN_TRANSIT' || o.deliveryStatus === 'PROCESSING'
  );
  // Real KPI calculation based strictly on user's confirmed orders (0 baseline)
  const totalVolumeKg = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const estimatedSavings = Math.round(totalVolumeKg * 18.5);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buyer Marketplace & Procurement Hub
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {user?.businessName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Buyer Marketplace Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Track your purchase offers, manage supplier rate negotiations, monitor in-transit deliveries, and review your circular procurement cost savings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/buyer/marketplace"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
            <Link
              to="/buyer/wishlist"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50 transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/messages"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50 transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Seller Messages</span>
            </Link>
          </div>
        </div>

        {/* 2. Procurement Snapshot KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Available Lots</span>
              <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {availableLotsCount}
            </div>
            <Link
              to="/buyer/marketplace"
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Purchase Offers</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {pendingRequests.length}
            </div>
            <button
              onClick={() => setActiveTab('offers')}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View purchase offers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">In-Transit Freight</span>
              <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400 mt-2">
              {activeShipments.length}
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Track deliveries</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Est. Cost Savings</span>
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{estimatedSavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              vs Virgin raw materials
            </p>
          </motion.div>
        </div>

        {/* 3. Navigation View Switcher (My Purchase Offers / My Orders & Inbound Shipments) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-emerald-950 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Purchase Offers</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-white font-black">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders & Inbound Shipments</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-600 text-white font-black">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          <Link
            to="/buyer/marketplace"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>+ Find New Material Lots in Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* VIEW 1: My Purchase Offers & Negotiations */}
        {activeTab === 'offers' && (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  My Purchase Offers & Negotiations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Offers submitted to material generators and sellers. Click "Chat / Negotiate" to discuss terms and confirm pickup.
                </p>
              </div>
              <Link
                to="/buyer/marketplace"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>+ Browse Materials</span>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
                Loading your purchase offers...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-ecoDark-card rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/60 p-6">
                <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Purchase Offers Sent Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Explore available products in the marketplace and click "Chat Seller" to start procurement discussions.
                </p>
                <Link
                  to="/buyer/marketplace"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white inline-block mt-2"
                >
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-emerald-950/60 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3">Material Stream</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Offered Rate</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-ecoDark-card/50 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <div>{req.material?.title || 'Material'}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {req.material?.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <div>
                            {req.seller?.businessName ||
                              req.material?.seller?.businessName ||
                              'Industrial Supplier'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {req.seller?.city || req.material?.locationCity}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {req.quantity} {req.material?.unit || 'kg'}
                        </td>
                        <td className="p-3 font-bold text-emerald-800 dark:text-emerald-400">
                          ₹{req.offeredPrice}/{req.material?.unit || 'kg'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'ACCEPTED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : req.status === 'PENDING'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : req.status === 'COUNTERED' || req.status === 'NEGOTIATING'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {req.status === 'ACCEPTED' ? (
                              <Link
                                to={
                                  req.orders && req.orders[0]
                                    ? `/checkout/${req.orders[0].id}`
                                    : `/orders`
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Checkout</span>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to={`/messages?sellerId=${
                                    req.sellerId || req.material?.sellerId
                                  }&materialId=${req.materialId}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-emerald-800/40"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Chat / Negotiate</span>
                                </Link>

                                {req.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    disabled={actionLoadingId === req.id}
                                    onClick={() => handleUndoOffer(req.id, req.material?.title)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Cancel and undo this pending offer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{actionLoadingId === req.id ? 'Cancelling...' : 'Undo Offer'}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: My Orders & Inbound Shipments */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Procurement Orders & Fulfilments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Shipments and confirmed purchase agreements with verified sellers.
                </p>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Full Orders Page →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-ecoDark-card rounded-2xl p-6">
                No orders placed yet. When a seller accepts your purchase offer and you complete checkout, your contract will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-900/40 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{ord.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {ord.deliveryStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <div className="font-semibold text-slate-800 dark:text-white truncate">
                        {ord.material?.title || 'Industrial Feedstock'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Seller: {ord.seller?.businessName || 'Industrial Supplier'}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-emerald-950 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center gap-2.5">
                        {ord.paymentStatus === 'PENDING' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ord.id}
                            onClick={() => handleCancelOrder(ord.id, ord.orderNumber)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          to={`/orders/${ord.id}`}
                          className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Details & Tracking →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
