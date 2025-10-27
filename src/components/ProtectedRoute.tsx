import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, LoadingScreen } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  allowPending?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredRole,
  allowPending = false
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile not loaded yet, show loading
  if (!profile) {
    return <LoadingScreen />;
  }

  // Handle suspended accounts
  if (profile.is_suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-destructive mb-4">Account Suspended</h2>
          <p className="text-muted-foreground mb-4">
            {profile.suspension_reason || 'Your account has been temporarily suspended.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Handle pending accounts
  if (profile.role === 'pending' && !allowPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-warning mb-4">Account Pending</h2>
          <p className="text-muted-foreground mb-4">
            Your account is currently under review. You'll be notified once it's approved.
          </p>
          <p className="text-sm text-muted-foreground">
            This usually takes 24-48 hours.
          </p>
        </div>
      </div>
    );
  }

  // Check role permissions
  const userRole = profile.role as UserRole;
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;