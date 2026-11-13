import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing, MaterialRequest, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { MarketplaceCard } from '../components/MarketplaceCard';
import {
  ShoppingCart,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Package,
  Clock,
  TrendingDown,
  Building2,
  Heart,
  Store,
  Layers,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Tag,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Data State
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingProcurement, setLoadingProcurement] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'offers' | 'orders'>('marketplace');

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
      // Guarantee strict numeric price and category matching on client state as well:
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

  // Fetch Buyer procurement activities (bids & orders)
  const fetchProcurementData = async () => {
    setLoadingProcurement(true);
    try {
      const [reqRes, ordRes] = await Promise.all([
        api.requests.getBuyerRequests().catch(() => ({ requests: [] })),
        api.orders.getAll({ role: 'buyer' }).catch(() => ({ orders: [] })),
      ]);
      setRequests(Array.isArray(reqRes.requests) ? reqRes.requests : []);
      setOrders(Array.isArray(ordRes.orders) ? ordRes.orders : []);
    } catch (err) {
      console.error('Failed to load buyer procurement data:', err);
    } finally {
      setLoadingProcurement(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceListings();
  }, [selectedCategory, selectedCondition]);

  useEffect(() => {
    fetchProcurementData();
  }, []);

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

  const pendingRequests = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'COUNTERED' || r.status === 'NEGOTIATING'
  );
  const activeShipments = orders.filter(
    (o) => o.deliveryStatus === 'IN_TRANSIT' || o.deliveryStatus === 'PROCESSING'
  );
  const totalVolumeKg = orders.reduce((sum, o) => sum + (o.quantity || 0), 1200);
  const estimatedSavings = Math.round(totalVolumeKg * 18.5);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buyer Marketplace & Procurement Hub
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {user?.businessName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Buyer Marketplace Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Discover verified industrial surplus, search recyclable materials by category, chat with sellers directly to negotiate rates, and manage your purchase orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/buyer/wishlist"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50 transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/messages"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Seller Messages</span>
            </Link>
          </div>
        </div>

        {/* 2. Procurement Snapshot KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Available Lots</span>
              <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {listings.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Verified active listings
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Bids Sent</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {pendingRequests.length}
            </div>
            <button
              onClick={() => setActiveTab('offers')}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View purchase offers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">In-Transit Freight</span>
              <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400 mt-2">
              {activeShipments.length}
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Track deliveries</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-ecoDark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Est. Cost Savings</span>
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{estimatedSavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              vs Virgin raw materials
            </p>
          </motion.div>
        </div>

        {/* 3. Navigation View Switcher (Marketplace Catalog / My Purchase Offers / My Orders) */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-emerald-950 pb-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Explore Products & Materials</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-black">
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Purchase Offers</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-white font-black">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-surface'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & Inbound Shipments</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-600 text-white font-black">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* VIEW 1: Full Marketplace Catalog with Search & Filters */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
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
        )}

        {/* VIEW 2: My Active Purchase Offers */}
        {activeTab === 'offers' && (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  My Purchase Offers & Negotiations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Offers submitted to material sellers. Click "Negotiate / Chat" to discuss terms.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
              >
                + Browse More Materials
              </button>
            </div>

            {loadingProcurement ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
                Loading your purchase offers...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-ecoDark-card rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/60 p-6">
                <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Purchase Offers Sent Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Explore available products and click "Chat Seller" or make an offer to start procurement discussions.
                </p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-emerald-950/60 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3">Material Stream</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Offered Rate</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-ecoDark-card/50 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <div>{req.material?.title || 'Material'}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {req.material?.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <div>
                            {req.seller?.businessName ||
                              req.material?.seller?.businessName ||
                              'Industrial Supplier'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {req.seller?.city || req.material?.locationCity}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {req.quantity} {req.material?.unit || 'kg'}
                        </td>
                        <td className="p-3 font-bold text-emerald-800 dark:text-emerald-400">
                          ₹{req.offeredPrice}/{req.material?.unit || 'kg'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'ACCEPTED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : req.status === 'PENDING'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : req.status === 'COUNTERED' || req.status === 'NEGOTIATING'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {req.status === 'ACCEPTED' ? (
                            <Link
                              to={
                                req.orders && req.orders[0]
                                  ? `/checkout/${req.orders[0].id}`
                                  : `/orders`
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Checkout</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/messages?sellerId=${
                                req.sellerId || req.material?.sellerId
                              }&materialId=${req.materialId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Chat / Negotiate</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: My Orders & Fulfilments */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Procurement Orders & Fulfilments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Shipments and confirmed purchase agreements with verified sellers.
                </p>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Full Orders Page →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-ecoDark-card rounded-2xl p-6">
                No orders placed yet. When a seller accepts your purchase offer and you complete checkout, your contract will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-900/40 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{ord.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {ord.deliveryStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <div className="font-semibold text-slate-800 dark:text-white truncate">
                        {ord.material?.title || 'Industrial Feedstock'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Seller: {ord.seller?.businessName || 'Industrial Supplier'}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-emerald-950 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to={`/orders/${ord.id}`}
                        className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Details & Tracking →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
