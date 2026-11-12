import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCategoryFallbackImage, getListingPrimaryImage } from '../utils/categoryImages';
import {
  Send,
  AlertCircle,
  Truck,
  Building2,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const RequestMaterialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<MaterialListing | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [pickupMethod, setPickupMethod] = useState<string>('EcoLoop Logistics');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadListing() {
      if (!id) return;
      try {
        const res = await api.materials.getById(id);
        setListing(res.listing);
        setQuantity(res.listing.minOrderQuantity || 1);
        setOfferedPrice(res.listing.pricePerUnit);
        setMessage(`Hello ${res.listing.seller?.businessName || 'Seller'}, we would like to procure ${res.listing.minOrderQuantity || 1} ${res.listing.unit} of "${res.listing.title}". Please confirm availability.`);
      } catch (err: any) {
        setError('Failed to load material for purchase request.');
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!listing) return;

    if (quantity < listing.minOrderQuantity) {
      setError(`Minimum order quantity is ${listing.minOrderQuantity} ${listing.unit}.`);
      return;
    }

    if (quantity > listing.quantity) {
      setError(`Available volume is capped at ${listing.quantity} ${listing.unit}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.requests.create({
        materialId: listing.id,
        quantity,
        offeredPrice,
        pickupMethod,
        message,
      });
      alert('Purchase request submitted successfully to seller! You will be notified when they respond.');
      navigate('/messages');
    } catch (err: any) {
      setError(err.message || 'Failed to submit purchase request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center py-20 px-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading material specifications...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Material Not Found</h2>
      </div>
    );
  }

  const subtotal = quantity * offeredPrice;
  const platformFee = Math.round(subtotal * 0.03 * 100) / 100;
  const logisticsEstimate = pickupMethod === 'EcoLoop Logistics' ? 450 : 0;
  const estimatedTotal = subtotal + platformFee + logisticsEstimate;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Material</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-10 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 transition-colors"
        >
          <div className="border-b border-slate-100 dark:border-emerald-950/60 pb-6 mb-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-ecoDark-card px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              Procurement Request
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Request Material Purchase
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Submit your formal purchase offer to <strong className="text-slate-800 dark:text-white">{listing.seller?.businessName}</strong>.
            </p>
          </div>

          {/* Material summary box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-950/60 flex items-center gap-4 mb-6">
            <img
              src={getListingPrimaryImage(listing)}
              alt={listing.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getCategoryFallbackImage(listing.category, listing.title);
              }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{listing.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {listing.category} • {listing.locationCity} • {listing.condition}
              </p>
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mt-1">
                Listed Rate: ₹{listing.pricePerUnit}/{listing.unit} (Available: {listing.quantity} {listing.unit})
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Required Volume ({listing.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min={listing.minOrderQuantity}
                  max={listing.quantity}
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  MOQ: {listing.minOrderQuantity} {listing.unit}
                </span>
              </div>

              {/* Offered Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Offered Price per {listing.unit} (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none font-semibold text-emerald-800 dark:text-emerald-400 bg-white dark:bg-ecoDark-card"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Listed at ₹{listing.pricePerUnit} (You can propose a discount)
                </span>
              </div>
            </div>

            {/* Pickup Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Fulfillment & Logistics Method *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'EcoLoop Logistics', label: 'EcoLoop Fleet', desc: 'Consolidated eco-freight (+₹450)' },
                  { id: 'Buyer pickup', label: 'Self Pickup', desc: 'Buyer dispatches own truck' },
                  { id: 'Seller delivery', label: 'Seller Delivery', desc: 'Seller handles transit' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setPickupMethod(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer text-left transition-all ${
                      pickupMethod === opt.id
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-ecoDark-card ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-emerald-950/80 hover:border-slate-300 dark:hover:border-emerald-800 bg-white dark:bg-ecoDark-surface'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Message to Seller */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Message to Supplier *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include handling constraints, unloading dock availability, or delivery schedule..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              />
            </div>

            {/* Price Breakdown Calculation */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-ecoDark-card border border-emerald-100 dark:border-emerald-500/20 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Material Subtotal ({quantity} {listing.unit} × ₹{offeredPrice})</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>EcoLoop Platform Escrow & Verification Fee (3%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              {logisticsEstimate > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>EcoLoop Logistics Freight Transit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{logisticsEstimate}</span>
                </div>
              )}
              <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-950/60 flex justify-between font-extrabold text-sm text-emerald-950 dark:text-white">
                <span>Estimated Total Outlay</span>
                <span className="text-base text-emerald-800 dark:text-emerald-400">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-xl font-bold text-sm bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-400 dark:text-emerald-200" />
                <span>{submitting ? 'Sending Request...' : 'Send Purchase Request'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
