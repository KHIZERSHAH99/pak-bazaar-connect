import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { UserRole } from '@/lib/types';

interface GuestProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowGuest?: boolean;
  wholesalerOnly?: boolean;
}

const GuestProtectedRoute: React.FC<GuestProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  allowGuest = false,
  wholesalerOnly = false
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If wholesaler only route and not logged in, redirect to login
  if (wholesalerOnly && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If wholesaler only route and not a wholesaler, redirect to login
  if (wholesalerOnly && user && profile?.role !== 'wholesaler' && profile?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If guest access is allowed, proceed
  if (allowGuest) {
    return <>{children}</>;
  }

  // If not logged in and guest not allowed, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to dashboard
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default GuestProtectedRoute;