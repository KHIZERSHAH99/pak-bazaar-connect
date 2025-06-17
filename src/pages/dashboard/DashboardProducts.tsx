
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductsManagement from '@/components/dashboard/ProductsManagement';

const DashboardProducts: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout>
        <ProductsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardProducts;
