import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModeration from '@/components/admin/AdminModeration';

const DashboardAdminModeration: React.FC = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <DashboardLayout>
      <AdminModeration />
    </DashboardLayout>
  </ProtectedRoute>
);

export default DashboardAdminModeration;
