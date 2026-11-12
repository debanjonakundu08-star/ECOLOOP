import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { getListingPrimaryImage } from '../utils/categoryImages';
import {
  Store,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Layers,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SellerListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SOLD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Fetch seller dashboard or listings
      const res = await api.seller.getDashboard();
      const myListings = res.myListings || [];
      setListings(myListings);
    } catch (err) {
      console.error('Failed to load seller listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (listingId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    setActionLoadingId(listingId);
    try {
      await api.materials.delete(listingId);
      setListings((prev) => prev.filter((item) => item.id !== listingId));
      setMessage({ text: `Listing "${title}" was removed successfully.`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete listing.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSold = async (item: MaterialListing) => {
    const isSold = item.availability?.toUpperCase() === 'SOLD';
    const nextAvailability = isSold ? 'AVAILABLE' : 'SOLD';

    setActionLoadingId(item.id);
    try {
      await api.materials.update(item.id, { availability: nextAvailability });
      setListings((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, availability: nextAvailability } : l))
      );
      setMessage({
        text: `Listing marked as ${nextAvailability === 'SOLD' ? 'Sold / Fulfilled' : 'Active & Available'}.`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update listing status.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredListings = listings.filter((item) => {
    const isSold = item.availability?.toUpperCase() === 'SOLD';
    if (filter === 'ACTIVE') return !isSold;
    if (filter === 'SOLD') return isSold;
    return true;
  });

  const activeCount = listings.filter((i) => i.availability?.toUpperCase() !== 'SOLD').length;
  const soldCount = listings.filter((i) => i.availability?.toUpperCase() === 'SOLD').length;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <Store className="w-3.5 h-3.5" />
                Seller Inventory Management
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {listings.length} Total Registered Lots
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Listed Surplus Lots
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Manage your published industrial lots, update prices and quantities, mark fulfilled streams as sold, or publish new recyclable inventory.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/seller/add-listing"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Listing</span>
            </Link>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-emerald-950 pb-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-ecoDark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card border border-slate-200 dark:border-emerald-900/60'
            }`}
          >
            All Listings ({listings.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ACTIVE'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-ecoDark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card border border-slate-200 dark:border-emerald-900/60'
            }`}
          >
            Active Lots ({activeCount})
          </button>
          <button
            onClick={() => setFilter('SOLD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'SOLD'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-ecoDark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card border border-slate-200 dark:border-emerald-900/60'
            }`}
          >
            Sold / Fulfilled ({soldCount})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Retrieving your catalog listings...
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-12 text-center border border-slate-200/80 dark:border-emerald-500/20 shadow-card max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Store className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {filter === 'ALL'
                ? 'No listings found'
                : filter === 'ACTIVE'
                ? 'No active lots available'
                : 'No sold items yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filter === 'ALL'
                ? 'You haven’t listed any industrial surplus lots yet. Create your first lot to start receiving bids.'
                : 'Items matching this filter will appear here.'}
            </p>
            {filter === 'ALL' && (
              <Link
                to="/seller/add-listing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish New Listing</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const imageUrl = getListingPrimaryImage(item);
              const isSold = item.availability?.toUpperCase() === 'SOLD';

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card overflow-hidden flex flex-col group transition-all"
                >
                  {/* Thumbnail & Badges */}
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

                    <div className="absolute top-3 right-3">
                      {isSold ? (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-amber-400" />
                          <span>Sold Out</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Details */}
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

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950">
                          <span className="text-[10px] text-slate-400 block font-semibold">Price per Unit</span>
                          <span className="font-bold text-slate-900 dark:text-white flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            {item.pricePerUnit} / {item.unit || 'kg'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950">
                          <span className="text-[10px] text-slate-400 block font-semibold">Available Quantity</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.quantity?.toLocaleString()} {item.unit || 'kg'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/materials/${item.id}/edit`}
                          className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 dark:hover:bg-ecoDark-hover text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit Listing</span>
                        </Link>
                        <button
                          onClick={() => handleToggleSold(item)}
                          disabled={actionLoadingId === item.id}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSold
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isSold ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Relist Active</span>
                            </>
                          ) : (
                            <>
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Mark Sold</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/materials/${item.id}`}
                          className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-ecoDark-card transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Public Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={actionLoadingId === item.id}
                          className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
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
