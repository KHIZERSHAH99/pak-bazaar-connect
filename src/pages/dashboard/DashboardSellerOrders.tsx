
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SellerOrders from '@/components/dashboard/SellerOrders';

const DashboardSellerOrders: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <SellerOrders />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardSellerOrders;
