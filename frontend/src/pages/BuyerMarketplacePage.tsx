import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing, MaterialRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { MarketplaceCard } from '../components/MarketplaceCard';
import {
  Search,
  Filter,
  X,
  Layers,
  RefreshCw,
  Clock,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Store,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerMarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Data State
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const categories = [
    'All',
    'Paper/Cardboard',
    'Plastic',
    'Metal',
    'Glass',
    'Wood',
    'Textile',
    'Food waste',
    'Packaging materials',
    'Construction materials',
    'Industrial scrap',
    'Furniture',
    'Business equipment',
  ];

  const conditions = [
    'All',
    'Clean / High Grade',
    'Surplus / Unused',
    'Minor Defects',
    'Recyclable / Unsorted',
    'Scrap',
  ];

  // Fetch Marketplace listings from database
  const fetchMarketplaceListings = async () => {
    setLoadingListings(true);
    try {
      const params: Record<string, any> = {
        sort: 'newest',
      };
      const cleanSearch = searchQuery.trim();
      if (cleanSearch) params.search = cleanSearch;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCondition && selectedCondition !== 'All') params.condition = selectedCondition;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await api.materials.getAll(params);
      const rawList = Array.isArray(res?.listings) ? res.listings : [];

      // Guarantee strict numeric price and category matching on client state
      const strictlyFiltered = rawList.filter((item) => {
        if (selectedCategory && selectedCategory !== 'All') {
          const sel = selectedCategory.toLowerCase();
          const itemCat = (item.category || '').toLowerCase();
          if (sel === 'paper' || sel === 'cardboard' || sel === 'paper/cardboard') {
            if (!itemCat.includes('paper') && !itemCat.includes('cardboard')) return false;
          } else if (itemCat !== sel && !itemCat.includes(sel)) {
            return false;
          }
        }
        const price = Number(item.pricePerUnit);
        if (minPrice !== '' && !isNaN(parseFloat(minPrice)) && price < parseFloat(minPrice)) {
          return false;
        }
        if (maxPrice !== '' && !isNaN(parseFloat(maxPrice)) && price > parseFloat(maxPrice)) {
          return false;
        }
        return true;
      });
      setListings(strictlyFiltered);
    } catch (err) {
      console.error('Failed to load marketplace listings for buyer:', err);
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch Buyer active purchase offers
  const fetchActiveOffers = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.requests.getBuyerRequests().catch(() => ({ requests: [] }));
      setRequests(Array.isArray(res.requests) ? res.requests : []);
    } catch (err) {
      console.error('Failed to load buyer requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceListings();
  }, [selectedCategory, selectedCondition]);

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  // Handle URL hash navigation e.g. #categories or #search
  useEffect(() => {
    if (location.hash === '#categories') {
      setTimeout(() => {
        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (location.hash === '#search') {
      setTimeout(() => {
        document.getElementById('buyer-search-input')?.focus();
      }, 100);
    }
  }, [location.hash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketplaceListings();
  };

  const handlePriceApply = () => {
    fetchMarketplaceListings();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMinPrice('');
    setMaxPrice('');
    api.materials.getAll({ sort: 'newest' }).then((res) => {
      setListings(Array.isArray(res?.listings) ? res.listings : []);
    });
  };

  const activeOffers = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'COUNTERED' || r.status === 'NEGOTIATING' || r.status === 'ACCEPTED'
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Marketplace Header Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Live Buyer Marketplace
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {user?.businessName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Industrial Feedstock & Surplus Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Source verified secondary materials, recyclable offcuts, and manufacturing surplus directly from regional generators at negotiated wholesale rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/buyer/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buyer Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Active Offers Section */}
        {activeOffers.length > 0 && (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Active Purchase Offers & Negotiations ({activeOffers.length})
                </h2>
              </div>
              <Link
                to="/buyer/dashboard"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Procurement Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOffers.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-950/60 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {req.material?.title || 'Material Lot'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : req.status === 'PENDING'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {req.seller?.businessName || req.material?.seller?.businessName || 'Verified Supplier'}
                    </p>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                      Offer: ₹{req.offeredPrice}/{req.material?.unit || 'kg'} • {req.quantity} {req.material?.unit || 'kg'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-emerald-950 flex items-center justify-end gap-2">
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
                        to={`/messages?sellerId=${req.sellerId || req.material?.sellerId}&materialId=${req.materialId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-white dark:bg-ecoDark-surface hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-900/60"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat / Negotiate</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar Section */}
        <div id="search" className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Search Surplus Feedstock & Materials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Query real-time inventory from regional factories, recyclers, and commercial generators.
              </p>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400">Quick queries:</span>
              {['Plastic Waste', 'Cardboard', 'Steel Scrap', 'Wood Pallets'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    api.materials.getAll({ search: tag, sort: 'newest' }).then((res) => {
                      setListings(Array.isArray(res?.listings) ? res.listings : []);
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-ecoDark-card text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Main Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-4 absolute pointer-events-none" />
              <input
                id="buyer-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by material title, description, e.g. 'Plastic Waste', 'HDPE Regrind', 'Steel Scrap'..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-slate-50/50 dark:bg-ecoDark-bg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchMarketplaceListings();
                  }}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="ml-3 px-6 py-3.5 rounded-2xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Search Listings
            </button>
          </form>
        </div>

        {/* Category Filter Pills Carousel */}
        <div id="categories" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filter by Material Category</span>
            </span>
            {(selectedCategory !== 'All' || selectedCondition !== 'All' || minPrice || maxPrice || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold text-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-ecoDark-surface text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-emerald-500/20 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls (Condition & Price Range) */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-2xl p-4 border border-slate-200/80 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Condition:</span>
            </div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">Price Range (₹):</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handlePriceApply}
              className="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors cursor-pointer"
            >
              Apply
            </button>
            {(minPrice !== '' || maxPrice !== '') && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  const params: Record<string, any> = { sort: 'newest' };
                  if (searchQuery.trim()) params.search = searchQuery.trim();
                  if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
                  if (selectedCondition && selectedCondition !== 'All') params.condition = selectedCondition;
                  api.materials.getAll(params).then((res) => {
                    setListings(Array.isArray(res?.listings) ? res.listings : []);
                  });
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear price filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div id="explore" className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Showing {listings.length} available waste listing{listings.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <span className="text-slate-400 text-[11px]">
            Click "Chat Seller" on any card to initiate direct pricing discussion
          </span>
        </div>

        {/* Material Cards Grid */}
        {loadingListings ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Loading marketplace listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-ecoDark-surface rounded-3xl border border-dashed border-slate-200 dark:border-emerald-900/60 p-8">
            <Store className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {minPrice !== '' || maxPrice !== ''
                ? selectedCategory !== 'All'
                  ? 'No products found matching your filter criteria.'
                  : 'No products found within this price range.'
                : selectedCategory !== 'All'
                ? 'No items available in this category right now.'
                : searchQuery.trim()
                ? `No products found matching "${searchQuery}".`
                : 'No materials match your search criteria'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {minPrice !== '' || maxPrice !== ''
                ? `No listings available in the ₹${minPrice || '1'}–₹${maxPrice || '∞'} range. Try broadening your price boundaries.`
                : selectedCategory !== 'All'
                ? `There are currently no listings published under ${selectedCategory}. Choose another category or check back soon.`
                : 'Try clearing your filters or searching for another material like "Paper/Cardboard" or "Plastic".'}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <MarketplaceCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
