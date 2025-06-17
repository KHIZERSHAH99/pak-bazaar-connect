
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SellerAnalytics from '@/components/dashboard/SellerAnalytics';

const DashboardSellerDashboard: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <SellerAnalytics />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardSellerDashboard;
