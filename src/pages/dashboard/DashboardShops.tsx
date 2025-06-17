
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShopsManagement from '@/components/dashboard/ShopsManagement';

const DashboardShops: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <ShopsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardShops;
