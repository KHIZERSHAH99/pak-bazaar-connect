
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { UserRole } from '@/lib/types';

interface FixedProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const FixedProtectedRoute: React.FC<FixedProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pakistani_green-700"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to dashboard
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default FixedProtectedRoute;
