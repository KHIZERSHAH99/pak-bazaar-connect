
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfessionalAdManagement from '@/components/ads/ProfessionalAdManagement';

const DashboardAds: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <ProfessionalAdManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAds;
