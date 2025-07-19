
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdManagementDashboard from '@/components/ads/AdManagementDashboard';

const DashboardAds: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <AdManagementDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAds;
