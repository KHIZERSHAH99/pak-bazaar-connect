
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrdersManagement from '@/components/dashboard/OrdersManagement';

const DashboardOrders: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <OrdersManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardOrders;
