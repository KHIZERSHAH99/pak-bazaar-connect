
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SellerAnalytics from '@/components/dashboard/SellerAnalytics';

const DashboardAnalytics: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler', 'admin']}>
      <DashboardLayout>
        <SellerAnalytics />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAnalytics;
