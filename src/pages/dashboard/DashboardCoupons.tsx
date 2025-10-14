import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CouponManagement from '@/components/coupons/CouponManagement';

const DashboardCoupons: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout title="Coupons - Pak Bazaar Connect">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">Coupons</h1>
            <p className="text-muted-foreground mt-2 font-poppins">Create and manage discount coupons for your products</p>
          </div>
          <CouponManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardCoupons;
