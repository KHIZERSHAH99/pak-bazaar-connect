import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentMethodsSetup from '@/components/payment/PaymentMethodsSetup';

const DashboardPayment: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['wholesaler']}>
      <DashboardLayout title="Payment Methods - PakMandi">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">Payment Methods</h1>
            <p className="text-muted-foreground mt-2 font-poppins">Manage your payment methods for receiving customer payments</p>
          </div>
          <PaymentMethodsSetup />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPayment;
