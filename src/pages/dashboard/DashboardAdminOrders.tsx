import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminOrderOversight from '@/components/admin/AdminOrderOversight';

const DashboardAdminOrders: React.FC = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <DashboardLayout>
      <AdminOrderOversight />
    </DashboardLayout>
  </ProtectedRoute>
);

export default DashboardAdminOrders;
