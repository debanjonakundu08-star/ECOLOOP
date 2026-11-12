import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill if demo parameter present
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo) {
      setEmail('greenpack@ecoloop.com');
      setPassword('ecoloop123');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/marketplace');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('greenpack@ecoloop.com');
    setPassword('ecoloop123');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-soft-gradient dark:bg-ecoDark-bg transition-colors duration-300 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-ecoDark-surface p-8 sm:p-10 rounded-3xl shadow-card dark:shadow-glow-sm border border-emerald-100 dark:border-emerald-500/20 transition-all duration-300"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 dark:from-emerald-600 dark:to-emerald-400 text-white shadow-md shadow-emerald-900/20">
            <Recycle className="w-6 h-6 animate-spin [animation-duration:15s]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign in to EcoLoop
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One unified business account to both buy &amp; sell circular materials
          </p>
        </div>

        {/* Demo Quick-Login Button */}
        <div className="bg-emerald-50/70 dark:bg-ecoDark-card/70 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Instant Demo Business Account:</span>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="w-full py-2.5 px-3 rounded-xl text-left bg-white dark:bg-ecoDark-surface border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs hover:shadow-xs flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-emerald-800 dark:text-emerald-400">Bengal Eco Packaging Ltd (Kolkata)</div>
              <div className="text-slate-400 dark:text-slate-400 text-[10px]">Buy from other businesses &amp; manage your own listings</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              Fill Demo
            </span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have a business account yet?{' '}
          <Link to="/signup" className="font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors">
            Register your enterprise
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
