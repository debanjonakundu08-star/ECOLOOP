import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest, MaterialListing, Order } from '../types';
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
import { motion } from 'framer-motion';

export const SellerDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    kpis: { activeListings: number; pendingRequests: number; completedSales: number; totalRevenue: number };
    recentRequests: MaterialRequest[];
    myListings: MaterialListing[];
    recentOrders: Order[];
    analytics: {
      monthlySales: Array<{ month: string; revenue: number; orders: number }>;
      categoryBreakdown: Array<{ name: string; value: number }>;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.seller.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-ecoDark-card px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              Merchant Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Seller Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor active waste streams, review incoming bids, and manage circular transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/seller/requests"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-ecoDark-surface text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-500/20 hover:bg-slate-50 dark:hover:bg-ecoDark-hover transition-colors shadow-2xs"
            >
              View All Bids ({data.kpis.pendingRequests})
            </Link>
            <Link
              to="/list-waste"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Waste</span>
            </Link>
          </div>
        </div>

        {/* 1. KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-ecoDark-surface p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
              <Boxes className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {data.kpis.activeListings}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              Live in marketplace
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-ecoDark-surface p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Bids</span>
              <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {data.kpis.pendingRequests}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              Awaiting your response
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-ecoDark-surface p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Sales</span>
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {data.kpis.completedSales}
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-1">
              Delivered transactions
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-ecoDark-surface p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Circulated Revenue</span>
              <IndianRupee className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-800 dark:text-emerald-400 mt-2">
              ₹{data.kpis.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
              Direct business proceeds
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
              to="/list-waste"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <span>+ Add material</span>
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
                        src={listing.images[0]?.url || (listing.category === 'Metal' || listing.title?.toLowerCase().includes('steel') ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80')}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = listing.category === 'Metal' || listing.title?.toLowerCase().includes('steel')
                            ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80'
                            : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
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
