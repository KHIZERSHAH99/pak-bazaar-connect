import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { LoadingScreen } from '@/contexts/AuthContextFixed';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'wholesaler' | 'seller';
  allowPending?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowPending = false 
}) => {
  const { user, profile, loading, isGuestSeller } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // Allow guest sellers for seller routes
  if (!user && requiredRole === 'seller' && isGuestSeller) {
    return <>{children}</>;
  }

  // Only require authentication for wholesaler and admin routes
  if (!user && (requiredRole === 'wholesaler' || requiredRole === 'admin')) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!profile) {
    // Profile not loaded yet, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Check for suspended accounts
  if (profile.is_suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Account Suspended</h3>
          <p className="text-red-600">
            {profile.suspension_reason || 'Your account has been suspended. Please contact support.'}
          </p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && profile.role !== requiredRole) {
    // Allow admin to access all routes
    if (profile.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Denied</h3>
            <p className="text-yellow-600">
              You don't have permission to access this page. Required role: {requiredRole}
            </p>
          </div>
        </div>
      );
    }
  }

  // Check for pending role status
  if (profile.role === 'pending' && !allowPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Account Pending Approval</h3>
          <p className="text-blue-600">
            Your account is awaiting approval. You'll receive access once an admin reviews your request.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;