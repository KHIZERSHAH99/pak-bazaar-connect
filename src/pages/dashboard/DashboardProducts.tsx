import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProductsManagement from '@/components/dashboard/ProductsManagement';
import ProductsErrorBoundary from '@/components/ui/ProductsErrorBoundary';

const DashboardProducts: React.FC = () => {
  return (
    <ProductsErrorBoundary>
      <DashboardLayout>
        <ProductsManagement />
      </DashboardLayout>
    </ProductsErrorBoundary>
  );
};

export default DashboardProducts;
