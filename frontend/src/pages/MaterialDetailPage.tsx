import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { MaterialListing, MatchResult } from '../types';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { EditListingModal } from '../components/EditListingModal';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Heart,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Camera,
  Edit3,
} from 'lucide-react';

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<MaterialListing | null>(null);
  const [aiMatch, setAiMatch] = useState<MatchResult | null>(null);
  const [related, setRelated] = useState<MaterialListing[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.materials.getById(id);
        if (res && res.listing) {
          setListing(res.listing);
          setAiMatch(res.aiMatch || null);
          setRelated(Array.isArray(res.related) ? res.related : []);
          const isMetal = res.listing.category === 'Metal' || res.listing.title?.toLowerCase().includes('steel');
          const defaultFallback = isMetal
            ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
          let firstImg = Array.isArray(res.listing.images) && res.listing.images.length > 0
            ? res.listing.images[0]?.url
            : defaultFallback;
          if (!firstImg || firstImg.includes('1504917599217')) {
            firstImg = defaultFallback;
          }
          setSelectedImage(firstImg);
        }
      } catch (err) {
        console.error('Failed to load material details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const toggleSave = async () => {
    if (!user) {
      alert('Please log in to save materials to your favorites.');
      return;
    }
    if (!listing) return;
    try {
      if (isSaved) {
        await api.saved.unsave(listing.id);
        setIsSaved(false);
      } else {
        await api.saved.save(listing.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-96 bg-slate-100 dark:bg-ecoDark-surface rounded-3xl mb-8" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Listing not found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This material may have been sold or archived by the seller.</p>
        <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isSellerOwner = user && user.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-ecoDark-card border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-sm transition-all"
              title="Edit company name or change photo"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Edit Listing / Upload Photo</span>
            </button>
            <div className="flex items-center gap-2">
              <Link to="/marketplace" className="hover:text-slate-800 dark:hover:text-white">Marketplace</Link>
              <span>/</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{listing.category}</span>
            </div>
          </div>
        </div>

        {/* Main Product Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-10 shadow-card border border-emerald-100/80 dark:border-emerald-500/20 transition-colors duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Image Showcase (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-500/20 shadow-inner">
                <img
                  src={selectedImage || (listing.category === 'Metal' || listing.title?.toLowerCase().includes('steel') ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80')}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = listing.category === 'Metal' || listing.title?.toLowerCase().includes('steel')
                      ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-ecoDark-surface text-emerald-900 dark:text-emerald-300 shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-500/30">
                    {listing.category}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImage === img.url ? 'border-emerald-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Seller Box */}
              {listing.seller && (
                <div className="p-5 bg-slate-50/80 dark:bg-ecoDark-card rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Listing Verified Seller
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                        <span>{listing.seller.businessName}</span>
                        {listing.seller.isVerified && (
                          <span title="Verified Enterprise">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{listing.seller.city} • {listing.seller.category || 'Manufacturer'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      Active Supplier
                    </span>
                  </div>
                  {listing.seller.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-emerald-950/60 pt-2.5">
                      "{listing.seller.bio}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Listing Details & Actions (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Title & Location Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {listing.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {listing.locationCity} ({listing.locationAddress})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Availability: <strong className="text-slate-700 dark:text-slate-200">{listing.availability}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Save toggle button */}
                  <button
                    onClick={toggleSave}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSaved
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-600'
                        : 'border-slate-200 dark:border-emerald-800 text-slate-500 dark:text-slate-400 hover:border-red-300 hover:text-red-500'
                    }`}
                    title="Save to favorites"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Price and Stock Banner */}
                <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 dark:bg-ecoDark-card border border-emerald-100 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Unit Selling Price</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                        ₹{typeof listing.pricePerUnit === 'number' ? listing.pricePerUnit.toLocaleString('en-IN') : (listing.pricePerUnit ?? 0)}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">/ {listing.unit || 'units'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Available Inventory</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {typeof listing.quantity === 'number' ? listing.quantity.toLocaleString('en-IN') : (listing.quantity ?? 0)}{' '}
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{listing.unit || 'units'}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      MOQ: {listing.minOrderQuantity ?? 1} {listing.unit || 'units'}
                    </span>
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950/60">
                    <span className="text-slate-400 block font-medium">Quality Condition</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{listing.condition}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950/60">
                    <span className="text-slate-400 block font-medium">Min Order (MOQ)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                      {listing.minOrderQuantity} {listing.unit}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950/60">
                    <span className="text-slate-400 block font-medium">Dispatch Readiness</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{listing.availability}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                    Material Specifications & Description
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-emerald-950/60 flex flex-col sm:flex-row items-center gap-3">
                {isSellerOwner ? (
                  <Link
                    to="/seller/dashboard"
                    className="w-full py-3.5 rounded-xl text-center font-bold text-sm bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 dark:hover:bg-ecoDark-hover text-slate-800 dark:text-white transition-colors"
                  >
                    Manage This Listing in Seller Hub
                  </Link>
                ) : (
                  <>
                    <Link
                      to={`/request/${listing.id}`}
                      className="w-full sm:flex-1 py-4 rounded-xl text-center font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
                    >
                      <span>Request Purchase / Make Offer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/messages?recipient=${listing.sellerId}`}
                      className="w-full sm:w-auto px-6 py-4 rounded-xl text-center font-bold text-sm bg-emerald-50 dark:bg-ecoDark-card hover:bg-emerald-100 dark:hover:bg-ecoDark-hover text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                    >
                      Inquire with Seller
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="w-full sm:w-auto px-5 py-4 rounded-xl text-center font-bold text-sm bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 dark:hover:bg-ecoDark-hover text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-emerald-900/60 transition-colors flex items-center justify-center gap-2"
                      title="Edit company name or change photo"
                    >
                      <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Edit Listing / Upload Photo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Circular Compatibility Breakdown Section */}
        {aiMatch && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                EcoLoop Smart Match Compatibility Analysis
              </h2>
            </div>
            <MatchScoreBadge match={aiMatch} compact={false} />
          </div>
        )}

        {/* Related Materials Section */}
        {related && related.length > 0 && (
          <div className="pt-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Similar {listing.category} Material Streams
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((item) => (
                <MarketplaceCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {listing && (
        <EditListingModal
          listing={listing}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            setListing(updated);
            const firstImg =
              (Array.isArray(updated.images) && updated.images[0]?.url) ||
              (updated as any).imageUrl ||
              selectedImage;
            setSelectedImage(firstImg);
          }}
        />
      )}
    </div>
  );
};
