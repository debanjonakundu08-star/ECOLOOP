import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest } from '../types';
import { useInterfaceMode } from '../context/InterfaceModeContext';
import { getListingPrimaryImage } from '../utils/categoryImages';
import {
  ShoppingCart,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Tag,
  ExternalLink,
  Search,
  AlertCircle,
  Send,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchToSeller } = useInterfaceMode();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED'>('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.requests.getBuyerRequests();
      setRequests(Array.isArray(res.requests) ? res.requests : []);
    } catch (err) {
      console.error('Failed to fetch buyer requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED').length;
  const counteredCount = requests.filter((r) => r.status === 'COUNTERED' || (r.status as string) === 'NEGOTIATING').length;
  const declinedCount = requests.filter((r) => r.status === 'DECLINED').length;

  const filtered = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'COUNTERED') {
      return r.status === 'COUNTERED' || (r.status as string) === 'NEGOTIATING';
    }
    return r.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner with Mode Indicator & Switcher */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buyer Procurement Stream
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Formal Sourcing Bids</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Sent Purchase Offers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Track real-time status of your price quotes sent to industrial material generators, review counter-offers, and execute secure escrow checkout.
            </p>
          </div>

          {/* Quick link to Switch to Seller Incoming Bids */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={switchToSeller}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-emerald-900/40 hover:bg-slate-200/60 dark:hover:bg-ecoDark-hover transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Switch to Incoming Seller Bids</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/marketplace"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find More Surplus</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-ecoDark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Bids Sent</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{requests.length}</div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Active sourcing inquiries</span>
          </div>
          <div className="bg-white dark:bg-ecoDark-surface p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Accepted &amp; Ready</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{acceptedCount}</div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Ready for payment</span>
          </div>
          <div className="bg-white dark:bg-ecoDark-surface p-4 rounded-2xl border border-purple-200/80 dark:border-purple-500/30 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Counter-Offers</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{counteredCount}</div>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Generator proposed rate</span>
          </div>
          <div className="bg-white dark:bg-ecoDark-surface p-4 rounded-2xl border border-amber-200/80 dark:border-amber-500/30 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Awaiting Response</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{pendingCount}</div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">In review by seller</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-emerald-950/60">
          {(['ALL', 'PENDING', 'ACCEPTED', 'COUNTERED', 'DECLINED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
              }`}
            >
              {tab === 'ALL' && `All Bids (${requests.length})`}
              {tab === 'PENDING' && `Pending Review (${pendingCount})`}
              {tab === 'ACCEPTED' && `Accepted (${acceptedCount})`}
              {tab === 'COUNTERED' && `Countered (${counteredCount})`}
              {tab === 'DECLINED' && `Declined (${declinedCount})`}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="bg-white dark:bg-ecoDark-surface p-12 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading purchase proposals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-ecoDark-surface p-12 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Offers Found in this Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {activeTab === 'ALL'
                  ? 'You haven’t submitted any purchase offers yet. Browse verified surplus waste in the marketplace and send your formal bids.'
                  : `You currently have zero offers with status "${activeTab}".`}
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explore Waste Listings</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const materialImg = req.material ? getListingPrimaryImage(req.material) : '/images/cat-cardboard.jpg';
              const isAccepted = req.status === 'ACCEPTED';
              const isCountered = req.status === 'COUNTERED' || (req.status as string) === 'NEGOTIATING';
              const isDeclined = req.status === 'DECLINED';
              const isPending = req.status === 'PENDING';

              const orderId = (req as any).orders?.[0]?.id || (req as any).orderId;

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 p-5 shadow-card hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Material Info & Seller */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={materialImg}
                        alt={req.material?.title || 'Material'}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200/80 dark:border-emerald-900/40 shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-emerald-800/40">
                            {req.material?.category || 'Secondary Material'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Offer sent {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <Link
                          to={`/materials/${req.materialId}`}
                          className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="truncate">{req.material?.title || 'Material Batch'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Seller: <strong className="text-slate-700 dark:text-slate-200">{req.seller?.businessName || req.material?.seller?.businessName || 'Verified Generator'}</strong></span>
                        </div>

                        {req.message && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-ecoDark-card px-3 py-1.5 rounded-lg border border-slate-100 dark:border-emerald-950/60 italic">
                            &ldquo;{req.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Offer Terms */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:border-x md:border-slate-100 md:dark:border-emerald-950/80 md:px-6 shrink-0">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Volume</span>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {req.quantity} {req.material?.unit || 'kg'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Offered Rate</span>
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          ₹{req.offeredPrice.toFixed(2)}/{req.material?.unit || 'kg'}
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Total</span>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{(req.quantity * req.offeredPrice).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Status & Buyer Action */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                      <div>
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Offer Accepted
                          </span>
                        )}
                        {isCountered && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Counter-Offer Received
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting Review
                          </span>
                        )}
                        {isDeclined && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700/60">
                            <XCircle className="w-3.5 h-3.5" />
                            Offer Declined
                          </span>
                        )}
                      </div>

                      {/* Action buttons depending on state */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isAccepted && (
                          <button
                            onClick={() => {
                              if (orderId) {
                                navigate(`/checkout/${orderId}`);
                              } else {
                                navigate('/orders');
                              }
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Proceed to Checkout</span>
                          </button>
                        )}

                        {isCountered && (
                          <Link
                            to="/messages"
                            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Review Counter in Chat</span>
                          </Link>
                        )}

                        {isPending && (
                          <Link
                            to="/messages"
                            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message Seller</span>
                          </Link>
                        )}

                        {isDeclined && (
                          <Link
                            to="/marketplace"
                            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Find Alternative</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Counter-offer callout if countered */}
                  {isCountered && req.counterPrice && (
                    <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/60 dark:bg-purple-950/30 p-3 rounded-xl text-xs">
                      <div className="text-purple-900 dark:text-purple-300">
                        <strong className="font-bold">Generator proposed rate: ₹{req.counterPrice.toFixed(2)}/{req.material?.unit || 'kg'}</strong>
                        {req.counterNotes && <span className="ml-2 text-purple-700 dark:text-purple-400 italic">(&ldquo;{req.counterNotes}&rdquo;)</span>}
                      </div>
                      <Link
                        to="/messages"
                        className="font-bold text-purple-800 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open negotiation conversation</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
