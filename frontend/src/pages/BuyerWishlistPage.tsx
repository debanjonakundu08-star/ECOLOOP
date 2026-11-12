import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing } from '../types';
import { getListingPrimaryImage } from '../utils/categoryImages';
import {
  Heart,
  ShoppingCart,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Trash2,
  MapPin,
  Building2,
  IndianRupee,
  Layers,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerWishlistPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<MaterialListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await api.saved.getSaved();
      setSavedItems(Array.isArray(res.savedListings) ? res.savedListings : []);
    } catch (err) {
      console.error('Failed to load saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (listingId: string) => {
    setRemovingId(listingId);
    try {
      await api.saved.unsave(listingId);
      setSavedItems((prev) => prev.filter((item) => item.id !== listingId));
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buyer Procurement Hub
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {savedItems.length} {savedItems.length === 1 ? 'item saved' : 'items saved'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Saved Items &amp; Wishlist</span>
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Track materials of interest, evaluate batch quality, and initiate direct negotiations with verified industrial sellers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/marketplace"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse All Surplus</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Loading your saved items...
            </p>
          </div>
        ) : savedItems.length === 0 ? (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-12 text-center border border-slate-200/80 dark:border-emerald-500/20 shadow-card max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bookmark listings from the marketplace to track material availability and negotiate with sellers.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => {
              const imageUrl = getListingPrimaryImage(item);
              const sellerName = item.seller?.businessName || 'Verified Enterprise';

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card overflow-hidden flex flex-col group transition-all"
                >
                  {/* Image & Category Tag */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-ecoDark-card overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>{item.category}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-ecoDark-card/90 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link
                        to={`/materials/${item.id}`}
                        className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{sellerName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.locationCity || 'Kolkata'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</div>
                          <div className="text-base font-black text-slate-900 dark:text-white flex items-center">
                            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{item.pricePerUnit}</span>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">
                              / {item.unit || 'kg'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lot Available</div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.quantity?.toLocaleString()} {item.unit || 'kg'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/materials/${item.id}`}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 dark:hover:bg-ecoDark-hover text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                        <Link
                          to={`/messages?sellerId=${item.sellerId || item.seller?.id}&materialId=${item.id}`}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat with Seller</span>
                        </Link>
                      </div>
                    </div>
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
