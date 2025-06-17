
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdApprovals from '@/components/dashboard/AdApprovals';

const DashboardAdApprovals: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <AdApprovals />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAdApprovals;
