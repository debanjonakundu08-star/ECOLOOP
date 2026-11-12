import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialRequest } from '../types';
import {
  Scale,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  X,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SellerRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'NEGOTIATING' | 'DECLINED'>('ALL');

  // Negotiate modal state
  const [negotiatingRequest, setNegotiatingRequest] = useState<MaterialRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterNotes, setCounterNotes] = useState<string>('');
  const [negotiatingLoading, setNegotiatingLoading] = useState(false);

  // View Buyer modal state
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.requests.getSellerRequests();
      setRequests(res.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await api.requests.updateStatus(requestId, { status });
      alert(res.message);
      if (res.order) {
        navigate(`/orders/${res.order.id}`);
      } else {
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update request.');
    }
  };

  const handleOpenNegotiate = (req: MaterialRequest) => {
    setNegotiatingRequest(req);
    setCounterPrice(req.counterPrice || req.offeredPrice);
    setCounterNotes(req.counterNotes || 'We can offer at this price with expedited dispatch.');
  };

  const submitNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiatingRequest) return;
    setNegotiatingLoading(true);
    try {
      await api.requests.updateStatus(negotiatingRequest.id, {
        status: 'NEGOTIATING',
        counterPrice,
        counterNotes,
      });
      alert('Counter-offer sent to buyer! Check the messaging room to continue discussions.');
      setNegotiatingRequest(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to submit counter offer.');
    } finally {
      setNegotiatingLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-ecoDark-card px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              Procurement Inquiries
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Buyer Material Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review, accept, or negotiate offers submitted for your waste streams.
            </p>
          </div>

          <Link
            to="/messages"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-ecoDark-surface text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-500/20 hover:bg-slate-50 dark:hover:bg-ecoDark-hover transition-colors shadow-2xs self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Open Negotiation Chats</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-emerald-950/60 pb-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'PENDING', label: 'Pending Response' },
            { id: 'ACCEPTED', label: 'Accepted Orders' },
            { id: 'NEGOTIATING', label: 'In Negotiation' },
            { id: 'DECLINED', label: 'Declined' },
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

        {/* Requests List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-medium text-slate-400 dark:text-slate-500">Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-12 text-center border border-slate-200/80 dark:border-emerald-500/20 shadow-xs">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No requests in this tab</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Incoming bids from verified buyers will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-ecoDark-surface rounded-2xl p-6 border border-slate-200/80 dark:border-emerald-500/20 shadow-card dark:shadow-glow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all"
              >
                {/* Left: Material and Buyer Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">{req.material?.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-900/60">
                      {req.material?.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' :
                      req.status === 'ACCEPTED' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' :
                      req.status === 'NEGOTIATING' ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' : 'bg-slate-100 dark:bg-ecoDark-card text-slate-600 dark:text-slate-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-ecoDark-card p-3.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-medium">Buyer Business</span>
                      <button
                        onClick={() => setSelectedBuyer(req.buyer)}
                        className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                      >
                        <span>{req.buyer.businessName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-medium">Volume Bid</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {req.quantity} {req.material?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-medium">Offered Rate</span>
                      <div className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        ₹{req.offeredPrice}/{req.material?.unit}
                        {req.counterPrice && (
                          <span className="text-[10px] text-purple-700 dark:text-purple-400 block">
                            (Counter: ₹{req.counterPrice})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-medium">Logistics Choice</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{req.pickupMethod}</span>
                    </div>
                  </div>

                  {/* Message & Counter note */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-ecoDark-surface p-3 rounded-xl border border-slate-100 dark:border-emerald-950/60">
                    <p className="font-medium text-slate-700 dark:text-slate-200">Buyer Note: "{req.message}"</p>
                    {req.counterNotes && (
                      <p className="mt-1 text-purple-700 dark:text-purple-400 font-semibold border-t border-purple-50 dark:border-purple-950/40 pt-1">
                        Seller Counter Note: "{req.counterNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {req.status === 'PENDING' || req.status === 'NEGOTIATING' ? (
                    <>
                      <button
                        onClick={() => handleAction(req.id, 'ACCEPTED')}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Offer & Create Order</span>
                      </button>

                      <button
                        onClick={() => handleOpenNegotiate(req)}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Negotiate Terms</span>
                      </button>

                      <button
                        onClick={() => handleAction(req.id, 'DECLINED')}
                        className="px-5 py-2 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  ) : req.status === 'ACCEPTED' ? (
                    <Link
                      to={req.orders && req.orders[0] ? `/orders/${req.orders[0].id}` : '/orders'}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-forest-900 dark:bg-emerald-600 text-white hover:bg-forest-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Confirmed Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : null}

                  <button
                    onClick={() => setSelectedBuyer(req.buyer)}
                    className="px-5 py-2 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors text-center cursor-pointer"
                  >
                    View Buyer Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Negotiate Counter-Offer Modal */}
        {negotiatingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                  <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Propose Counter-Offer</span>
                </div>
                <button
                  onClick={() => setNegotiatingRequest(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Negotiate rate for <strong className="text-slate-800 dark:text-white">{negotiatingRequest.material?.title}</strong> with {negotiatingRequest.buyer.businessName}.
              </p>

              <form onSubmit={submitNegotiation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Counter Price per {negotiatingRequest.material?.unit} (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-purple-500 focus:outline-none font-bold text-purple-900 dark:text-purple-300 bg-white dark:bg-ecoDark-card"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Buyer initially offered ₹{negotiatingRequest.offeredPrice}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Negotiation Terms / Message to Buyer
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={counterNotes}
                    onChange={(e) => setCounterNotes(e.target.value)}
                    placeholder="Specify freight conditions, moisture tolerance, packaging..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-purple-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNegotiatingRequest(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-ecoDark-card cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={negotiatingLoading}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Counter-Offer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Buyer Modal */}
        {selectedBuyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Buyer Information</span>
                </div>
                <button
                  onClick={() => setSelectedBuyer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Enterprise Name</span>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <span>{selectedBuyer.businessName}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Industry Stream</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBuyer.category}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{selectedBuyer.city} ({selectedBuyer.address || 'Registered Industrial Hub'})</span>
                </div>

                {selectedBuyer.phone && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{selectedBuyer.phone}</span>
                  </div>
                )}

                {selectedBuyer.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{selectedBuyer.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/60 flex justify-end">
                <button
                  onClick={() => setSelectedBuyer(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-ecoDark-hover cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
