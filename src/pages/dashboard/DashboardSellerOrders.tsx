
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EnhancedOrderManagement } from '@/components/orders/EnhancedOrderManagement';

const DashboardSellerOrders: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <EnhancedOrderManagement userRole="seller" />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardSellerOrders;
