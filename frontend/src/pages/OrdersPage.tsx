import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  PackageCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'BUYER';
  const isSeller = user?.role === 'SELLER';
  const defaultRole = isBuyer ? 'buyer' : isSeller ? 'seller' : 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [role, setRole] = useState<'all' | 'buyer' | 'seller'>(defaultRole);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const effectiveRole = isBuyer ? 'buyer' : isSeller ? 'seller' : (role === 'all' ? undefined : role);
      const res = await api.orders.getAll({
        status: activeTab === 'ALL' ? undefined : activeTab,
        role: effectiveRole,
      });

      const currentUserId = user?.id;
      // Strict user isolation check
      const filteredOrders = (Array.isArray(res.orders) ? res.orders : []).filter((o) => {
        if (!currentUserId) return true;
        if (isBuyer) return o.buyerId === currentUserId;
        if (isSeller) return o.sellerId === currentUserId;
        return o.buyerId === currentUserId || o.sellerId === currentUserId;
      });

      setOrders(filteredOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, role, user?.id]);

  const handleCancelOrder = async (orderId: string, orderNumber?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel pending order #${orderNumber || orderId}?`
    );
    if (!confirmed) return;

    try {
      await api.orders.delete(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-ecoDark-card px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              Procurement & Fulfillment
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Orders & Commercial Transactions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track freight status, simulated escrow clearances, and environmental savings receipts.
            </p>
          </div>

          {/* Role Filter toggle */}
          <div className="flex bg-slate-100 dark:bg-ecoDark-surface p-1 rounded-xl self-start sm:self-auto text-xs font-bold border border-slate-200/60 dark:border-emerald-500/20">
            <button
              onClick={() => setRole('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                role === 'all' ? 'bg-white dark:bg-ecoDark-hover text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setRole('buyer')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                role === 'buyer' ? 'bg-white dark:bg-ecoDark-hover text-emerald-800 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setRole('seller')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                role === 'seller' ? 'bg-white dark:bg-ecoDark-hover text-emerald-800 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sales
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-emerald-950/60 pb-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Shipments' },
            { id: 'ACTIVE', label: 'Active / In Transit' },
            { id: 'COMPLETED', label: 'Delivered & Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-ecoDark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-hover border border-slate-200/60 dark:border-emerald-500/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-medium text-slate-400 dark:text-slate-500">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-12 text-center border border-slate-200/80 dark:border-emerald-500/20 shadow-xs space-y-3">
            <PackageCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No orders found in this view</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When purchase requests are accepted by sellers, transaction orders are automatically established here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isBuyer = order.buyerId === user?.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-ecoDark-surface rounded-2xl p-6 border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Order Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        order.deliveryStatus === 'DELIVERED' ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300' :
                        order.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300' : 'bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300'
                      }`}>
                        Transit: {order.deliveryStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-ecoDark-card p-3.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-medium">Material Item</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                          {order.material?.title}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-medium">Quantity Volume</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                          {order.quantity} {order.material?.unit}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-medium">Trade Partner</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
                          {isBuyer ? `Seller: ${order.seller.businessName}` : `Buyer: ${order.buyer.businessName}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-medium">Total Transaction</span>
                        <span className="font-black text-emerald-800 dark:text-emerald-400 block mt-0.5 text-sm">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    {/* Pay button if buyer and pending */}
                    {isBuyer && order.paymentStatus === 'PENDING' && (
                      <Link
                        to={`/checkout/${order.id}`}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{order.totalAmount.toLocaleString('en-IN')} (Simulated)</span>
                      </Link>
                    )}

                    {/* Cancel button if buyer and pending */}
                    {isBuyer && order.paymentStatus === 'PENDING' && order.deliveryStatus !== 'DELIVERED' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        className="px-5 py-2 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-forest-900 dark:bg-emerald-600 text-white hover:bg-forest-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Order Details & Invoice</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
