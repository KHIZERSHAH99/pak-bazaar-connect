
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import WholesalerDashboard from '@/components/dashboard/WholesalerDashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import PendingDashboard from '@/components/dashboard/PendingDashboard';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const renderDashboardContent = () => {
    if (!profile) return null;
    
    // Only show role selection for users who explicitly have 'pending' role or no role at all
    if (!profile.role || profile.role === 'pending') {
      return <PendingDashboard />;
    }
    
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return <WholesalerDashboard />;
      case 'seller':
        return <SellerDashboard />;
      default:
        return <PendingDashboard />;
    }
  };

  return <DashboardLayout>{renderDashboardContent()}</DashboardLayout>;
};

const DashboardWithAuth = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default DashboardWithAuth;
