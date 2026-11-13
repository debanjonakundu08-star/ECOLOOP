import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Recycle,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRoleParam = searchParams.get('role');
  const hasExplicitRole = !!initialRoleParam && (initialRoleParam.toLowerCase() === 'buyer' || initialRoleParam.toLowerCase() === 'seller');
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRoleParam?.toLowerCase() === 'seller' ? 'SELLER' : 'BUYER'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync role if url query changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam?.toLowerCase() === 'seller') {
      setSelectedRole('SELLER');
    } else if (roleParam?.toLowerCase() === 'buyer') {
      setSelectedRole('BUYER');
    }
  }, [searchParams]);

  // Auto-fill demo credentials based on selected role
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo) {
      if (selectedRole === 'SELLER') {
        setEmail('greenpack@ecoloop.com');
        setPassword('ecoloop123');
      } else {
        setEmail('purchase@greentechpolymers.in');
        setPassword('ecoloop123');
      }
    }
  }, [searchParams, selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password, selectedRole);
      const destination = (loggedUser.role || selectedRole) === 'SELLER'
        ? '/seller/dashboard'
        : '/buyer/marketplace';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please verify your business credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillRoleDemo = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'SELLER') {
      setEmail('greenpack@ecoloop.com');
      setPassword('ecoloop123');
    } else {
      setEmail('purchase@greentechpolymers.in');
      setPassword('ecoloop123');
    }
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
        className="max-w-md w-full space-y-6 bg-white dark:bg-ecoDark-surface p-8 sm:p-10 rounded-3xl shadow-card dark:shadow-glow-sm border border-emerald-100 dark:border-emerald-500/20 transition-all duration-300"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 dark:from-emerald-600 dark:to-emerald-400 text-white shadow-md shadow-emerald-900/20">
            <Recycle className="w-6 h-6 animate-spin [animation-duration:15s]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to EcoLoop
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your account type to access your dedicated dashboard
          </p>
        </div>

        {/* Role Selection or Locked Role Badge */}
        {hasExplicitRole ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                {selectedRole === 'BUYER' ? (
                  <ShoppingCart className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                ) : (
                  <Store className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Continuing as {selectedRole === 'BUYER' ? 'Buyer' : 'Seller'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedRole === 'BUYER' ? 'Accessing live material marketplace' : 'Accessing waste seller dashboard'}
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors shrink-0"
            >
              Switch Role
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Choose Your Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-950/60">
              <button
                type="button"
                onClick={() => setSelectedRole('BUYER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'BUYER'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-900 dark:text-white shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                <span>Continue as Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('SELLER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'SELLER'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-900 dark:text-white shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                <span>Continue as Seller</span>
              </button>
            </div>
          </div>
        )}

        {/* Demo Quick-Login Banner */}
        <div className="bg-emerald-50/70 dark:bg-ecoDark-card/70 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Demo Account ({selectedRole === 'BUYER' ? 'Buyer' : 'Seller'})</span>
            </span>
            <button
              type="button"
              onClick={() => fillRoleDemo(selectedRole)}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              Fill Demo
            </button>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {selectedRole === 'BUYER'
              ? 'GreenTech Polymers (Howrah) — Sourcing & procurement view'
              : 'Bengal Eco Packaging Ltd (Kolkata) — Waste listings & inventory view'}
          </p>
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'BUYER' ? 'buyer@company.com' : 'seller@company.com'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-emerald-500/20 bg-slate-50/50 dark:bg-ecoDark-bg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-emerald-500/20 bg-slate-50/50 dark:bg-ecoDark-bg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 shadow-md shadow-emerald-700/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole === 'BUYER' ? 'Buyer' : 'Seller'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-emerald-950/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              to={hasExplicitRole ? `/signup?role=${selectedRole.toLowerCase()}` : '/signup'}
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {hasExplicitRole ? `Register as ${selectedRole === 'BUYER' ? 'Buyer' : 'Seller'}` : 'Create a Business Account'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
