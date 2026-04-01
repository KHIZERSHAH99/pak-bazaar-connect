import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import InventoryDashboard from '@/components/dashboard/InventoryDashboard';

const DashboardInventory: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">Track stock levels and restock products</p>
        </div>
        <InventoryDashboard />
      </div>
    </DashboardLayout>
  );
};

export default DashboardInventory;
