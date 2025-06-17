
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WholesalerOrders from '@/components/dashboard/WholesalerOrders';

const DashboardWholesalerOrders: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <WholesalerOrders />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardWholesalerOrders;
