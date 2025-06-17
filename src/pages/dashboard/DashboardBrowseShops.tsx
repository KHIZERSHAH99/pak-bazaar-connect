
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import BrowseShops from '@/components/dashboard/BrowseShops';

const DashboardBrowseShops: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <BrowseShops />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardBrowseShops;
