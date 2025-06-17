
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdsManagement from '@/components/dashboard/AdsManagement';

const DashboardAds: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <AdsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAds;
