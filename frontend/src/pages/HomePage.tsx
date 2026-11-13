import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { MaterialListing, ImpactSummary } from '../types';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Recycle,
  ShieldCheck,
  Truck,
  Leaf,
  Search,
  CheckCircle2,
  Zap,
  ShoppingCart,
  Store,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'BUYER') {
    return <Navigate to="/buyer/marketplace" replace />;
  }
  if (user?.role === 'SELLER') {
    return <Navigate to="/seller/dashboard" replace />;
  }
  const [featuredListings, setFeaturedListings] = useState<MaterialListing[]>([]);
  const [impactData, setImpactData] = useState<ImpactSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [matRes, impRes] = await Promise.all([
          api.materials.getAll({ limit: 4 }),
          api.impact.getSummary(),
        ]);
        const listings = matRes && Array.isArray(matRes.listings) ? matRes.listings.slice(0, 4) : [];
        setFeaturedListings(listings);
        if (impRes) setImpactData(impRes);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const categories = [
    { name: 'Paper/Cardboard', icon: '📦', count: '1200+ kg', desc: 'Corrugated cartons, pulp, trimmings' },
    { name: 'Plastic', icon: '🧴', count: '3500+ kg', desc: 'HDPE drums, PET regrind, polymer flakes' },
    { name: 'Metal', icon: '🔩', count: '4500+ kg', desc: 'Rebar offcuts, aluminum turnings, scrap' },
    { name: 'Glass', icon: '🍾', count: '2800+ pcs', desc: 'Amber bottles, clear jars, cullet' },
    { name: 'Wood', icon: '🪵', count: '5000+ kg', desc: 'ISPM-15 pallets, wood shavings, timber' },
    { name: 'Textile', icon: '🧵', count: '1800+ kg', desc: 'Combed cotton, knit offcuts, yarn' },
    { name: 'Industrial scrap', icon: '⚙️', count: '1100+ kg', desc: 'CNC turnings, machine shavings' },
    { name: 'Food waste', icon: '🌱', count: '950+ kg', desc: 'Spent coffee, brewery grain, compostables' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg transition-colors duration-300">
      {/* 1. Hero Section with Animated Glow Blobs */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#032d1e] to-[#01140e] dark:from-[#03170e] dark:via-[#021f14] dark:to-[#010905] text-white pt-16 pb-24 lg:pt-24 lg:pb-32 transition-colors duration-300">
        {/* Animated Glow Blobs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Pill tag */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 dark:bg-emerald-950/80 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-sm cursor-default"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>India's Premier B2B Circular Economy Platform</span>
            </motion.div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
              Turn Business Waste Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 animate-pulse">
                Business Value
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              EcoLoop connects manufacturing, industrial, and commercial enterprises with certified recyclers and secondary manufacturers. Convert excess inventory and scrap into revenue while meeting corporate ESG targets.
            </p>

            {/* Search Bar inside Hero */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl mx-auto">
              <div className="relative flex items-center bg-white dark:bg-ecoDark-surface rounded-2xl shadow-2xl p-1.5 border border-white/20 dark:border-emerald-500/30 transition-all focus-within:ring-2 focus-within:ring-emerald-400">
                <Search className="w-5 h-5 text-slate-400 dark:text-emerald-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search cardboard, HDPE plastic, steel offcuts, pallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:scale-105 active:scale-95 shrink-0 shadow-md shadow-emerald-700/40"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Role Selection Gateway: Continue as Buyer vs Continue as Seller */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              {/* Buyer Portal Card */}
              <div className="bg-white/10 dark:bg-emerald-950/60 p-6 rounded-2xl border border-white/20 dark:border-emerald-500/30 backdrop-blur-md hover:bg-white/15 transition-all group flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      <ShoppingCart className="w-3 h-3" />
                      Buyer Portal
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-black text-white">Continue as Buyer</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Browse verified secondary commodities, filter by grade &amp; volume, negotiate directly via live chat, and track orders.
                  </p>
                </div>
                <Link
                  to={user ? (user.role === 'BUYER' ? '/buyer/dashboard' : '/buyer/dashboard') : '/login?role=buyer'}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{user && user.role === 'BUYER' ? 'Go to Buyer Hub' : 'Enter as Buyer'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Seller Portal Card */}
              <div className="bg-white/10 dark:bg-emerald-950/60 p-6 rounded-2xl border border-white/20 dark:border-emerald-500/30 backdrop-blur-md hover:bg-white/15 transition-all group flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
                      <Store className="w-3 h-3" />
                      Seller Portal
                    </span>
                    <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-black text-white">Continue as Seller</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Monetize industrial production scrap, upload photos, manage active listings, and communicate with interested buyers.
                  </p>
                </div>
                <Link
                  to={user ? (user.role === 'SELLER' ? '/seller/dashboard' : '/seller/dashboard') : '/login?role=seller'}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-surface hover:bg-slate-100 text-slate-900 dark:text-white text-center transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{user && user.role === 'SELLER' ? 'Go to Seller Dashboard' : 'Enter as Seller'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                GST-Verified Businesses
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Integrated Regional Logistics
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Direct Regional Sourcing
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Platform Statistics Counter */}
      <section className="relative -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-ecoDark-surface rounded-2xl shadow-xl dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/30 p-6 sm:p-8 transition-colors duration-300"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-emerald-950/60">
            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {impactData ? `${impactData.metrics.totalMaterialsReusedTons} Tons` : '12.4 Tons'}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Materials Diverted
              </div>
            </div>

            <div className="p-2 pt-6 md:pt-2">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                ₹{impactData ? (impactData.metrics.totalValueExchanged / 100000).toFixed(1) : '3.8'}L+
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Value Circulated
              </div>
            </div>

            <div className="p-2 pt-6 md:pt-2">
              <div className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400">
                {impactData ? `${impactData.metrics.totalCo2SavedKg.toLocaleString('en-IN')} kg` : '8,420 kg'}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                CO₂ Emissions Saved
              </div>
            </div>

            <div className="p-2 pt-6 md:pt-2">
              <div className="text-3xl sm:text-4xl font-black text-forest-800 dark:text-emerald-300">
                {impactData ? impactData.metrics.completedTransactions : '8'}+
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Closed B2B Trades
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. How EcoLoop Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/60">
            Circular Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            How EcoLoop Closes the Loop
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            A frictionless end-to-end marketplace engineered for commercial waste generators and material processors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'List Excess Waste', desc: 'Businesses upload scrap specifications, weight, condition, photographs, and minimum order requirements in under 2 minutes.' },
            { step: '02', title: 'Direct Discovery & Filtering', desc: 'Search and filter verified surplus lots by city proximity, category, pricing tier, and condition grade.' },
            { step: '03', title: 'Direct Negotiation', desc: 'Negotiate unit pricing, counter-offer terms, select freight options (Self or EcoLoop Fleet), and approve purchase orders.' },
            { step: '04', title: 'Escrow & Impact Log', desc: 'Simulated settlement triggers instant order dispatch and computes verified carbon, water, and landfill diversion records.' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-ecoDark-card rounded-2xl p-6 border border-slate-200/80 dark:border-emerald-500/20 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-400/60 dark:hover:shadow-glow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg mb-4 border border-emerald-100 dark:border-emerald-800/40">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Featured Marketplace Materials */}
      <section className="py-16 bg-white dark:bg-ecoDark-surface/60 border-y border-slate-100 dark:border-emerald-950/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/60">
                Fresh Inventory
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Featured Materials Ready for Reuse
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified high-grade industrial surplus and recyclable lots available across Kolkata, Howrah, and Eastern India.
              </p>
            </div>

            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              <span>View All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-50 dark:bg-ecoDark-card rounded-2xl aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredListings || []).filter(Boolean).map((item, idx) => (
                <MarketplaceCard key={item.id || idx} listing={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Circular Material Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Browse by Industrial Waste Stream
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Categorized materials with verified purity standards and volume availability.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c, idx) => (
            <Link
              key={idx}
              to={`/marketplace?category=${encodeURIComponent(c.name)}`}
              className="group p-5 bg-white dark:bg-ecoDark-card rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-400/60 dark:hover:shadow-glow-sm hover:scale-[1.02] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>{c.count}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Environmental Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-[#031c12] to-[#01110a] text-white relative overflow-hidden border-t border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700">
                ESG & Sustainability Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Empowering Businesses to Decarbonize Supply Chains
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                By rerouting post-production excess directly into industrial reuse, EcoLoop curtails virgin raw material extraction, saves operational disposal costs, and generates verified lifecycle carbon offsets.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Direct Virgin Resource Displacement</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Every ton of recycled cardboard saves 17 trees and up to 26,000 liters of fresh water.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Full Traceability & CSR Documentation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Automated environmental impact receipts generated per transaction for corporate filings.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Substantial Cost Optimization</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Buyers purchase secondary feedstock at 30% to 60% below primary market indices.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/impact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 text-forest-950 hover:bg-emerald-400 transition-colors shadow-md"
                >
                  <span>Explore Environmental Impact Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Impact Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.03 }} className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm space-y-2">
                <div className="text-3xl font-extrabold text-emerald-400">1.85 kg</div>
                <div className="text-xs font-bold text-white">CO₂ Saved per kg Plastic</div>
                <p className="text-[11px] text-slate-400">Avoids oil refining and polymer cracking emissions.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm space-y-2">
                <div className="text-3xl font-extrabold text-emerald-400">3.50 kg</div>
                <div className="text-xs font-bold text-white">CO₂ Saved per kg Metal</div>
                <p className="text-[11px] text-slate-400">Massive energy reduction vs blast furnace smelting.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm space-y-2">
                <div className="text-3xl font-extrabold text-emerald-400">26 L</div>
                <div className="text-xs font-bold text-white">Water Saved per kg Paper</div>
                <p className="text-[11px] text-slate-400">Reduces intense water effluent treatment loads.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm space-y-2">
                <div className="text-3xl font-extrabold text-emerald-400">100%</div>
                <div className="text-xs font-bold text-white">Zero Landfill Goal</div>
                <p className="text-[11px] text-slate-400">Direct closed-loop transport from seller to factory.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Quick Role Demo Switcher / Fast Test Box */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-ecoDark-surface dark:via-ecoDark-card dark:to-[#04170e] rounded-3xl p-8 sm:p-10 border border-emerald-200/80 dark:border-emerald-500/30 shadow-card flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300"
        >
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/90 px-3 py-1 rounded-full">
              Demo Access Hub
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Test Both Buyer and Seller Roles
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Experience the separated interfaces instantly using our pre-configured industrial buyer and seller demo accounts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              to="/login?role=buyer&demo=true"
              className="px-5 py-3 rounded-xl text-center font-bold text-xs bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Login as Buyer Demo</span>
            </Link>
            <Link
              to="/login?role=seller&demo=true"
              className="px-5 py-3 rounded-xl text-center font-bold text-xs bg-slate-900 dark:bg-ecoDark-surface text-white hover:bg-slate-800 border border-slate-700 dark:border-emerald-500/30 transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Login as Seller Demo</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
