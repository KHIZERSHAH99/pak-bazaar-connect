
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProductsManagement from '@/components/dashboard/ProductsManagement';

const DashboardProducts: React.FC = () => {
  return (
    <DashboardLayout>
      <ProductsManagement />
    </DashboardLayout>
  );
};

export default DashboardProducts;
