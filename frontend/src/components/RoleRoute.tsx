import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center p-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Verifying security and role permissions...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?role=${allowedRole.toLowerCase()}&redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const userRole = (user.role || 'BUYER').toUpperCase();
  const requiredRole = allowedRole.toUpperCase();

  if (userRole !== requiredRole) {
    // Prevent cross-role URL tampering:
    // If a BUYER tries to visit SELLER routes -> redirect to /buyer/dashboard
    // If a SELLER tries to visit BUYER routes -> redirect to /seller/dashboard
    const fallbackPath = userRole === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
