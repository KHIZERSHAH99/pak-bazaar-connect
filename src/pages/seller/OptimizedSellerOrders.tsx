
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import OptimizedSellerOrders from '@/components/dashboard/OptimizedSellerOrders';

const OptimizedSellerOrdersPage: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <OptimizedSellerOrders />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default OptimizedSellerOrdersPage;
