import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PublicLandingPage } from '../pages/PublicLandingPage';

/**
 * RootGateway manages the entry point to EcoLoop.
 * - Unauthenticated visitors landing on '/' see the dedicated Public Home / Landing Page.
 * - Authenticated Buyers are automatically directed to their dedicated '/buyer/marketplace'.
 * - Authenticated Sellers are automatically directed to their dedicated '/seller/dashboard'.
 */
export const RootGateway: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-ecoDark-bg">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'SELLER') {
      return <Navigate to="/seller/listings" replace />;
    }
    return <Navigate to="/buyer/marketplace" replace />;
  }

  return <PublicLandingPage />;
};
