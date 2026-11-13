import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Recycle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Store,
  ShoppingCart,
  DollarSign,
  Layers,
  Building2,
  Leaf,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Send,
  Sun,
  Moon,
  Sparkles,
  TrendingDown,
  Scale,
  FileCheck,
  Clock,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PublicLandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    role: 'Buyer',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', company: '', role: 'Buyer', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#071a13] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Dedicated Public Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 dark:bg-[#071a13]/90 backdrop-blur-md border-b border-emerald-950/10 dark:border-emerald-500/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand / Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 dark:from-emerald-600 dark:to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
                <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0A3323] dark:text-white">
                  Eco<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  B2B
                </span>
              </div>
            </Link>

            {/* Center: In-page navigation links */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#how-it-works"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                How it Works
              </a>
              <a
                href="#about-us"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                About Us
              </a>
              <a
                href="#commission"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Pricing & Fees
              </a>
              <a
                href="#contact"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Right: Theme Toggle & Login/SignUp Pill Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-800" />
                )}
              </button>

              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0A3323] hover:bg-emerald-900 text-white shadow-md shadow-emerald-950/20 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Login / SignUp</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Oversized Headline & Two Primary CTAs */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 text-center bg-gradient-to-b from-[#FAF8F5] via-[#F4F7F4] to-[#FAF8F5] dark:from-[#071a13] dark:via-[#092219] dark:to-[#071a13] transition-colors duration-300">
        {/* Subtle background ambient circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>India's Premier B2B Circular Waste Marketplace</span>
          </motion.div>

          {/* Bold, Oversized ECOLOOP Display Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[#0A3323] dark:text-white tracking-tighter leading-none"
          >
            ECO<span className="text-emerald-600 dark:text-emerald-400">LOOP</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A3323]/90 dark:text-emerald-200 mt-5 tracking-tight"
          >
            Turn Business Waste Into Business Value
          </motion.p>

          {/* Supporting Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed font-medium"
          >
            Connect businesses that have reusable waste with businesses that need sustainable raw materials.
          </motion.p>

          {/* Two Primary CTA Buttons Side-by-Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10"
          >
            {/* CTA 1: Explore Marketplace (Locks in Buyer role) */}
            <Link
              to="/login?role=buyer"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm tracking-wide bg-[#0A3323] hover:bg-emerald-900 text-white shadow-xl shadow-emerald-950/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-emerald-800 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </Link>

            {/* CTA 2: List Your Waste (Locks in Seller role) */}
            <Link
              to="/login?role=seller"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm tracking-wide bg-white hover:bg-slate-50 text-[#0A3323] border-2 border-[#0A3323] dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>List Your Waste</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </Link>
          </motion.div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-emerald-900/10 dark:border-emerald-500/20 text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Verified B2B</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">GST-audited accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
              <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">30-50% Savings</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct factory pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Zero Listing Fee</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">100% success-based</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Zero Landfill</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified carbon offset</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section (#how-it-works) */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[#061711] border-y border-emerald-900/10 dark:border-emerald-500/20 transition-colors duration-300 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Clear & Transparent Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A3323] dark:text-white mt-4 tracking-tight">
              How EcoLoop Works for Sellers & Buyers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 font-medium">
              A dual-sided industrial platform architected to eliminate friction in industrial waste valorization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Seller Journey Column */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-500/30 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">For Waste Sellers</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Manufacturers, Mills, Warehouses & Recyclers</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">List Waste Streams in Minutes</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Catalog manufacturing scrap, packaging offcuts, or machinery. Specify weight volume (kg/MT), condition grade, price per unit, and warehouse address.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Manage Inbound Offers & Real-Time Bids</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Receive immediate quotation requests from pre-vetted buyers. Negotiate volume discounts, schedule sample tests, and counteroffer directly in dedicated chat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fulfill Orders & Receive Escrow Payout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Confirm purchase orders, authorize weighment slips upon dispatch, and receive guaranteed payouts directly into your commercial account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-200/60 dark:border-emerald-900/40">
                <Link
                  to="/login?role=seller"
                  className="w-full py-3.5 rounded-2xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Start Listing as a Seller</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Buyer Journey Column */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-500/30 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0A3323] dark:bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">For Material Buyers</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Reprocessors, Compounders, Artisans & Converters</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Browse Live Feedstock Inventory</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Explore live inventory of secondary plastics, wood chips, cardboard bales, metal turnings, and industrial scrap across India's manufacturing hubs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Filter by Specifications & Price Ceilings</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Pinpoint materials by exact category, minimum and maximum unit prices (₹/kg or ₹/piece), condition grade (Sorted, Regrind, Scrap), and cluster distance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Negotiate Bulk Rates & Track Inbound Freight</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Engage directly with the seller in end-to-end encrypted messaging, close contracts at discounted wholesale rates, and monitor inbound shipment tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-200/60 dark:border-emerald-900/40">
                <Link
                  to="/login?role=buyer"
                  className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#0A3323] hover:bg-emerald-900 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Explore Feedstock as a Buyer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Us Section (#about-us) */}
      <section id="about-us" className="py-20 bg-[#FAF8F5] dark:bg-[#071a13] transition-colors duration-300 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Our Purpose & Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A3323] dark:text-white mt-4 tracking-tight">
              About EcoLoop
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 font-medium">
              Transforming India's discarded industrial by-products into high-grade secondary resources.
            </p>
          </div>

          {/* Point-wise Breakdown: Why EcoLoop is Helpful */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-3xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-5">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">1. Landfill Diversion</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Millions of tons of production offcuts, sawdust, plastic regrinds, and scrap metals are needlessly dumped. EcoLoop reroutes clean by-products directly back into remanufacturing cycles.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-5">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">2. 30%–50% Procurement Savings</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Raw material costs represent over 60% of manufacturing overheads. By cutting out middleman markups and procuring secondary commodities, buyers cut input expenses by up to half.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-ecoDark-surface border border-emerald-100 dark:border-emerald-900/40 shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">3. Verifiable B2B Circular Supply Chains</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every transaction on EcoLoop generates digital weighment receipts, ESG carbon savings metrics, and statutory compliance trails, ensuring enterprise transparency.
              </p>
            </div>
          </div>

          {/* Mission & Circular Economy Ecosystem Banner */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0A3323] via-[#06291b] to-[#041a10] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/60">
                Our Mission
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-4 leading-tight">
                Forging a Closed-Loop Industrial Future
              </h3>
              <p className="text-sm text-emerald-100/90 mt-4 leading-relaxed font-normal">
                Our mission is to decouple economic growth from resource depletion. EcoLoop establishes a robust, reliable, and standardized marketplace where one factory's production surplus becomes the vital foundation for another enterprise's breakthrough product.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-xs text-emerald-200 font-semibold">
                <span className="flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standardized Material Specs
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-Time B2B Messaging
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Digital Waste Ledger
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transparent Platform Revenue & Commission Structure (#commission) */}
      <section id="commission" className="py-20 bg-white dark:bg-[#061711] border-y border-emerald-900/10 dark:border-emerald-500/20 transition-colors duration-300 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Fair & Transparent Economics
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A3323] dark:text-white mt-4 tracking-tight">
              Platform Revenue & Commission Structure
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 font-medium">
              We operate on a pure success-based model. We only generate revenue when a transaction successfully settles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zero Listing Fees */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  0%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Zero Listing Fees</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Listing materials, creating an enterprise profile, managing catalog items, and receiving buyer inquiries is 100% free with zero upfront charges or monthly recurring subscriptions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ 100% Free For All Sellers
              </div>
            </div>

            {/* Standard Industrial Scrap */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  2.5%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Standard Scrap Materials</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Applies to high-turnover recyclables such as Cardboard/Paper bales, HDPE/PP polymer flakes, clean wood pallets, textiles, and iron scrap upon invoice settlement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ 2.5% to 3.0% Facilitation Fee
              </div>
            </div>

            {/* Hazardous & Specialized Residues */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  3.5%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Specialized & Hazardous Residues</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Industrial chemical by-products, foundry slag, and electronic circuit boards requiring State Pollution Control Board (SPCB) transfer manifest validation and verified handlers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ 3.5% Compliant Transfer Facilitation
              </div>
            </div>

            {/* Heavy Equipment & Assets */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  4.0%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Machinery & Reusable Equipment</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Used industrial motors, CNC machines, injection molds, and storage silos. Escrow payout is facilitated with a hard fee cap of ₹25,000 per asset transaction.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Flat 4.0% (Capped at ₹25,000 max)
              </div>
            </div>

            {/* High-Volume Enterprise Contracts */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  1.5%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Enterprise Recurring Contracts</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Bulk off-take agreements exceeding 10 Metric Tons per month. Enjoy dedicated account management, coordinated freight dispatch, and tiered volume pricing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Tiered 1.5% Volume Discount
              </div>
            </div>

            {/* Buyer Assurance & Escrow Hold */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-4">
                  1.0%
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Buyer Protection Escrow</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Optional milestone-based payment holdback. Funds are secured safely in commercial escrow until the delivery is weighed, inspected, and accepted at the buyer dock.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Optional 1.0% Safe Assurance Hold
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dedicated Clean Contact Section (#contact) */}
      <section id="contact" className="py-20 bg-[#FAF8F5] dark:bg-[#071a13] transition-colors duration-300 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A3323] dark:text-white mt-4 tracking-tight">
              Contact EcoLoop Support & Partnerships
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
              Have questions about listing materials, bulk procurement, or platform integration? Reach out anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white dark:bg-ecoDark-surface p-8 sm:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-card">
            {/* Contact Details Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Connect With Our Team</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Our B2B logistics and industrial sourcing desk responds to all enquiries within 4 business hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Direct Support</p>
                    <a href="mailto:support@ecoloop.in" className="font-bold hover:text-emerald-600 transition-colors">
                      support@ecoloop.in
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Enterprise Desk</p>
                    <p className="font-bold">+91 (033) 2840-7790</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Operations Hub</p>
                    <p className="font-bold">Sector V, Salt Lake & Howrah Industrial Cluster, WB</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/20">
                <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                  ⚡ Operational Hours: Mon – Sat, 9:00 AM – 7:00 PM IST
                </p>
              </div>
            </div>

            {/* Quick Enquiry Form */}
            <div className="md:col-span-3">
              {contactSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-3" />
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Message Received!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm">
                    Thank you for reaching out. An EcoLoop industrial representative will contact your company shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Sen"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="purchase@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Company / Factory Name
                      </label>
                      <input
                        type="text"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        placeholder="e.g. GreenTech Polymers"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        I am interested as
                      </label>
                      <select
                        value={contactForm.role}
                        onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Buyer">Material Buyer / Reprocessor</option>
                        <option value="Seller">Industrial Waste Seller / Mill</option>
                        <option value="Enterprise">Enterprise Bulk Contract</option>
                        <option value="Other">Other Enquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Enquiry / Material Requirements *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Specify material types, estimated monthly volumes, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-ecoDark-card text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#0A3323] hover:bg-emerald-900 text-white flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-300" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Dedicated Public Landing Footer */}
      <footer className="bg-gradient-to-b from-[#041a10] to-[#010c07] text-slate-300 py-12 border-t border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-900/30">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-forest-950 font-black shadow-md">
                <Recycle className="w-5 h-5 text-forest-950" />
              </div>
              <span className="text-xl font-black text-white">
                Eco<span className="text-emerald-400">Loop</span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
              <a href="#about-us" className="hover:text-emerald-400 transition-colors">About Us</a>
              <a href="#commission" className="hover:text-emerald-400 transition-colors">Commission Structure</a>
              <a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a>
              <Link to="/login?role=buyer" className="hover:text-emerald-400 transition-colors font-bold text-emerald-300">Buyer Sign In</Link>
              <Link to="/login?role=seller" className="hover:text-emerald-400 transition-colors font-bold text-emerald-300">Seller Sign In</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} EcoLoop Technologies Pvt. Ltd. All rights reserved.</p>
            <p>Turn Business Waste Into Business Value • Kolkata & Regional Clusters</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
