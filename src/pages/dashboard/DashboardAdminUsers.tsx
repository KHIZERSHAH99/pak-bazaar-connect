import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminUserManagement from '@/components/admin/AdminUserManagement';

const DashboardAdminUsers: React.FC = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <DashboardLayout>
      <AdminUserManagement />
    </DashboardLayout>
  </ProtectedRoute>
);

export default DashboardAdminUsers;
