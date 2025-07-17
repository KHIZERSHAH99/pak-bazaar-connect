
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import BrowseShops from '@/components/dashboard/BrowseShops';

const DashboardBrowseShops: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout
        title="Browse Shops - Pak Bazaar Connect"
        description="Discover and connect with verified wholesalers across Pakistan"
      >
        <BrowseShops />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardBrowseShops;
