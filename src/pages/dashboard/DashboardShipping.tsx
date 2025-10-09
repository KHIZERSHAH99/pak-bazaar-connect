import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ShippingManagement from '@/components/dashboard/ShippingManagement';

const DashboardShipping: React.FC = () => {
  return (
    <DashboardLayout>
      <ShippingManagement />
    </DashboardLayout>
  );
};

export default DashboardShipping;
