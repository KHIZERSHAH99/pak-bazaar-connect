import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminPlatformAnalytics from '@/components/admin/AdminPlatformAnalytics';

const DashboardAdminAnalytics: React.FC = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <DashboardLayout>
      <AdminPlatformAnalytics />
    </DashboardLayout>
  </ProtectedRoute>
);

export default DashboardAdminAnalytics;
