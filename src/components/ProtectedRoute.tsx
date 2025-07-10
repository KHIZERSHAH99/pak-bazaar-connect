
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, LoadingScreen } from '@/contexts/AuthContextFixed';
import { UserRole } from '@/lib/types'; // Updated import to use /lib/types

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
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

  // If roles are specified and user doesn't have required role, redirect to dashboard
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
