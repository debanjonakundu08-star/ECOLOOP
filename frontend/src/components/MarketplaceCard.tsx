import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MaterialListing } from '../types';
import { MapPin, Heart, ArrowRight, ShieldCheck, Tag, Camera } from 'lucide-react';
import { EditListingModal } from './EditListingModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MarketplaceCardProps {
  listing: MaterialListing;
  isSavedInitial?: boolean;
  onListingUpdated?: (updated: MaterialListing) => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ listing, isSavedInitial = false, onListingUpdated }) => {
  const { user } = useAuth();
  const [currentListing, setCurrentListing] = useState<MaterialListing>(listing);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);
  const isOwner = Boolean(user && currentListing?.sellerId && user.id === currentListing.sellerId);

  useEffect(() => {
    setCurrentListing(listing);
  }, [listing]);

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

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Paper/Cardboard': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  'Plastic': 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
  'Metal': 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80',
  'Glass': 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
  'Wood': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'Textile': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  'Food waste': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  'Packaging materials': 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&q=80',
  'Construction materials': 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
  'Industrial scrap': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'Business equipment': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
};

  if (!currentListing) return null;

  const isSteelOrMetal = currentListing.category === 'Metal' || currentListing.title?.toLowerCase().includes('steel') || currentListing.title?.toLowerCase().includes('metal');
  const catFallback = isSteelOrMetal
    ? 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80'
    : (CATEGORY_FALLBACKS[currentListing.category || ''] || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80');

  let primaryImage = catFallback;
  if (Array.isArray(currentListing.images) && currentListing.images.length > 0) {
    const found = currentListing.images.find((img) => img?.isPrimary)?.url;
    primaryImage = found || currentListing.images[0]?.url || primaryImage;
  } else if (typeof (currentListing as any)?.imageUrl === 'string' && (currentListing as any).imageUrl) {
    primaryImage = (currentListing as any).imageUrl;
  }

  // Intercept old broken unsplash metal URL
  if (primaryImage.includes('1504917599217')) {
    primaryImage = 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80';
  }

  const sellerBusinessName =
    (currentListing as any).companyName ||
    currentListing.seller?.businessName ||
    (typeof currentListing.seller === 'string' ? currentListing.seller : 'Enterprise Partner');
  const isSellerVerified = Boolean(currentListing.seller?.isVerified ?? true);
  const formattedQuantity = typeof currentListing.quantity === 'number' ? currentListing.quantity.toLocaleString('en-IN') : (currentListing.quantity ?? 0);
  const formattedPrice = typeof currentListing.pricePerUnit === 'number' ? currentListing.pricePerUnit.toLocaleString('en-IN') : (currentListing.pricePerUnit ?? 0);
  const materialUnit = currentListing.unit || 'units';
  const locationCity = currentListing.locationCity || 'Kolkata';

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="group relative bg-white dark:bg-ecoDark-card rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card hover:shadow-card-hover dark:hover:shadow-glow-sm hover:border-emerald-300 dark:hover:border-emerald-400/50 transition-all duration-300 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-ecoDark-surface">
          <img
            src={primaryImage}
            alt={currentListing.title || 'Material'}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = catFallback;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category tag */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-ecoDark-surface/90 text-emerald-900 dark:text-emerald-300 shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-500/30">
              <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {currentListing.category || 'General'}
            </span>
          </div>

          {/* Action buttons (Top Right) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {/* Edit / Change Photo Button - Only visible to the listing owner */}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-ecoDark-surface/90 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
                title="Edit company name or upload custom photo for this waste"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                <span className="text-[11px] font-bold">Edit / Photo</span>
              </button>
            )}

            {/* Save button */}
            <button
              onClick={toggleSave}
              disabled={saving}
              className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-transform active:scale-90 ${
                isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 dark:bg-ecoDark-surface/80 hover:bg-white text-slate-600 dark:text-slate-300 hover:text-red-500'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save listing'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Condition Grade */}
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm border border-white/10">
              {currentListing.condition || 'Inspected'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Location & Seller */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[60%]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{locationCity}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold truncate max-w-[45%]">
                <span className="truncate">{sellerBusinessName}</span>
                {isSellerVerified && (
                  <span title="Verified Enterprise">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <Link to={`/materials/${currentListing.id}`}>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {currentListing.title || 'Secondary Material Batch'}
              </h3>
            </Link>

            {/* Description snippet */}
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {currentListing.description || 'Pre-inspected surplus material batch available for industrial reuse.'}
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
            to={`/materials/${currentListing.id}`}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all group/btn shadow-sm active:scale-[0.98]"
          >
            <span>View Details & Request</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Interactive Edit Modal - Owner only */}
      {isOwner && (
        <EditListingModal
          listing={currentListing}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            setCurrentListing(updated);
            if (onListingUpdated) {
              onListingUpdated(updated);
            }
          }}
        />
      )}
    </>
  );
};
