import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCategoryFallbackImage, getListingPrimaryImage } from '../utils/categoryImages';
import {
  ShoppingCart,
  Clock,
  Package,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Search,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyerData() {
      setLoading(true);
      try {
        const [reqRes, ordRes] = await Promise.all([
          api.requests.getBuyerRequests().catch(() => ({ requests: [] })),
          api.orders.getAll({ role: 'buyer' }).catch(() => ({ orders: [] })),
        ]);
        setRequests(Array.isArray(reqRes.requests) ? reqRes.requests : []);
        setOrders(Array.isArray(ordRes.orders) ? ordRes.orders : []);
      } catch (err) {
        console.error('Failed to load buyer hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyerData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'PENDING' || r.status === 'COUNTERED' || r.status === 'NEGOTIATING');
  const activeShipments = orders.filter((o) => o.deliveryStatus === 'IN_TRANSIT' || o.deliveryStatus === 'PROCESSING');
  const totalVolumeKg = orders.reduce((sum, o) => sum + (o.quantity || 0), 1200);
  const estimatedSavings = Math.round(totalVolumeKg * 18.5);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Quick Action Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buyer Procurement Hub
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{user?.businessName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Buyer Procurement Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Source verified industrial surplus, manage purchase bids, track inbound shipments, and monitor virgin-material cost savings.
            </p>
          </div>

          {/* Quick Buyer Shortcuts */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <Link
              to="/buyer/wishlist"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50 transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Saved Wishlist</span>
            </Link>
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>

        {/* 4 Procurement KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Bids Sent</span>
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {pendingRequests.length}
            </div>
            <Link
              to="/buyer/requests"
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>View purchase offers</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
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
            <Link
              to="/orders?role=buyer"
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>Track deliveries</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Secondary Volume</span>
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {(totalVolumeKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-400">Tons</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Clean industrial feedstock
            </div>
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
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              vs Virgin raw materials
            </div>
          </motion.div>
        </div>

        {/* Section 1: Active Purchase Offers & Requests */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                My Purchase Offers &amp; Negotiations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Offers you have submitted to material sellers across the marketplace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Marketplace</span>
              </Link>
              <Link
                to="/buyer/requests"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors"
              >
                <span>View All Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
              Loading your purchase offers...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-ecoDark-card rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/60 p-6">
              <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Purchase Offers Sent Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore the marketplace and click "Request Purchase / Make Offer" on any listing to negotiate rates with sellers.
              </p>
              <Link
                to="/marketplace"
                className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white"
              >
                Browse Available Materials
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-emerald-950/60 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-3">Material Stream</th>
                    <th className="p-3">Seller / Generator</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Offered Rate</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-ecoDark-card/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <img
                          src={req.material?.images?.[0]?.url || getCategoryFallbackImage(req.material?.category, req.material?.title)}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getCategoryFallbackImage(req.material?.category, req.material?.title);
                          }}
                        />
                        <div className="truncate max-w-[200px]">
                          <div>{req.material?.title || 'Material'}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{req.material?.category}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                        <div>{req.seller?.businessName || req.material?.seller?.businessName || 'Enterprise Partner'}</div>
                        <div className="text-[10px] text-slate-400">{req.seller?.city || req.material?.locationCity}</div>
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
                              : (req.status === 'COUNTERED' || req.status === 'NEGOTIATING')
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {req.status === 'ACCEPTED' ? (
                          <Link
                            to={req.orders && req.orders[0] ? `/checkout/${req.orders[0].id}` : `/orders`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Checkout</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/messages?recipient=${req.sellerId || req.material?.sellerId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Chat with seller"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Negotiate</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Procurement Orders & Deliveries */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Procurement Orders &amp; Fulfilments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Shipments and purchase contracts placed with commercial sellers.
              </p>
            </div>
            <Link
              to="/orders?role=buyer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No orders placed yet. When a seller accepts your purchase offer, your order will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.slice(0, 3).map((ord) => (
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
                      {ord.material?.title || 'Industrial Material'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Seller: {ord.seller?.businessName || 'Industrial Supplier'}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-emerald-950 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                    <Link
                      to={`/orders/${ord.id}`}
                      className="font-bold text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Quick Sourcing Streams */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold">Procure By Secondary Feedstock Stream</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Jump directly to verified regional suppliers by waste category:
              </p>
            </div>
            <Link
              to="/marketplace"
              className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              All Marketplace Categories
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              { label: 'Paper & Boxes', cat: 'Paper/Cardboard' },
              { label: 'HDPE & Plastic', cat: 'Plastic' },
              { label: 'Wood Pallets', cat: 'Wood' },
              { label: 'Steel & Metals', cat: 'Metal' },
              { label: 'Glass Cullet', cat: 'Glass' },
              { label: 'Textile Fiber', cat: 'Textile' },
            ].map((st) => (
              <Link
                key={st.cat}
                to={`/marketplace?category=${encodeURIComponent(st.cat)}`}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-center text-xs font-semibold"
              >
                {st.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
