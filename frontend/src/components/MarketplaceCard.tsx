import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MaterialListing } from '../types';
import { MapPin, Heart, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MarketplaceCardProps {
  listing: MaterialListing;
  isSavedInitial?: boolean;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ listing, isSavedInitial = false }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save listings to your favorites.');
      return;
    }
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  if (!listing) return null;

  let primaryImage = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    const found = listing.images.find((img) => img?.isPrimary)?.url;
    primaryImage = found || listing.images[0]?.url || primaryImage;
  } else if (typeof (listing as any)?.imageUrl === 'string' && (listing as any).imageUrl) {
    primaryImage = (listing as any).imageUrl;
  }

  const sellerBusinessName = listing.seller?.businessName || (typeof listing.seller === 'string' ? listing.seller : 'Verified Enterprise');
  const isSellerVerified = Boolean(listing.seller?.isVerified);
  const formattedQuantity = typeof listing.quantity === 'number' ? listing.quantity.toLocaleString('en-IN') : (listing.quantity ?? 0);
  const formattedPrice = typeof listing.pricePerUnit === 'number' ? listing.pricePerUnit.toLocaleString('en-IN') : (listing.pricePerUnit ?? 0);
  const materialUnit = listing.unit || 'units';
  const locationCity = listing.locationCity || 'Kolkata';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative bg-white dark:bg-ecoDark-card rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card hover:shadow-card-hover dark:hover:shadow-glow-sm hover:border-emerald-300 dark:hover:border-emerald-400/50 transition-all duration-300 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-ecoDark-surface">
        <img
          src={primaryImage}
          alt={listing.title || 'Material'}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-ecoDark-surface/90 text-emerald-900 dark:text-emerald-300 shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-500/30">
            <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {listing.category || 'General'}
          </span>
        </div>

        {/* Save button */}
        <button
          onClick={toggleSave}
          disabled={saving}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-transform active:scale-90 ${
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-ecoDark-surface/80 hover:bg-white text-slate-600 dark:text-slate-300 hover:text-red-500'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* AI Match Badge (if available) */}
        {listing.aiMatch && (
          <div className="absolute bottom-3 left-3">
            <MatchScoreBadge match={listing.aiMatch} compact={true} />
          </div>
        )}

        {/* Condition Grade */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm border border-white/10">
            {listing.condition || 'Inspected'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Seller */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{locationCity}</span>
            </div>
            {listing.seller && (
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium truncate max-w-[40%]">
                <span className="truncate">{sellerBusinessName}</span>
                {isSellerVerified && (
                  <span title="Verified Business">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/materials/${listing.id}`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              {listing.title || 'Secondary Material Batch'}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {listing.description || 'Pre-inspected surplus material batch available for industrial reuse.'}
          </p>
        </div>

        {/* Pricing, Quantity, and Action */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Available Volume</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {formattedQuantity}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{materialUnit}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Price / {materialUnit}</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ₹{formattedPrice}
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/materials/${listing.id}`}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all group/btn shadow-sm active:scale-[0.98]"
        >
          <span>View Details & Request</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};
