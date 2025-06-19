
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard';

const DashboardAdmin: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <EnhancedAdminDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAdmin;
