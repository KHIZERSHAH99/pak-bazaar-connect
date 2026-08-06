import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminOrderOversight from '@/components/admin/AdminOrderOversight';
import AdminOrderActivityLog from '@/components/admin/AdminOrderActivityLog';

const DashboardAdminOrders: React.FC = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <DashboardLayout>
      <div className="space-y-4">
        <AdminOrderOversight />
        <AdminOrderActivityLog />
      </div>
    </DashboardLayout>
  </ProtectedRoute>
);

export default DashboardAdminOrders;
