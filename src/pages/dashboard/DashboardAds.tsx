
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';


const DashboardAds: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Ads Management</h1>
          <p className="text-gray-600 mt-2">Ad management functionality will be restored after AdSense approval.</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardAds;
