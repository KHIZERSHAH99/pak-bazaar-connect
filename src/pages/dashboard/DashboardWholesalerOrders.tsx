
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EnhancedOrderManagement } from '@/components/orders/EnhancedOrderManagement';

const DashboardWholesalerOrders: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <EnhancedOrderManagement userRole="wholesaler" />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardWholesalerOrders;
