
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WholesalerOrdersEnhanced from '@/components/dashboard/WholesalerOrdersEnhanced';

const DashboardWholesalerOrdersEnhanced: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <WholesalerOrdersEnhanced />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardWholesalerOrdersEnhanced;
