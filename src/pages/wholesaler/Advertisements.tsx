
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EnhancedCreateAdDialog from '@/components/ads/EnhancedCreateAdDialog';
import AdManagementDashboard from '@/components/ads/AdManagementDashboard';
import { useQuery } from '@tanstack/react-query';
import { getProductsByWholesaler } from '@/lib/products';

const Advertisements: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: products = [] } = useQuery({
    queryKey: ['wholesaler-products'],
    queryFn: getProductsByWholesaler,
  });

  const handleCreateClick = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);
  const handleAdCreated = () => {
    // Refresh will be handled by react-query
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-poppins">Advertisement Management</h1>
            <p className="text-gray-600 mt-1 font-poppins">Manage your advertisement campaigns and track performance</p>
          </div>
          <Button 
            onClick={handleCreateClick}
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
            disabled={products.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        </div>

        <AdManagementDashboard />
      </div>

      <EnhancedCreateAdDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onAdCreated={handleAdCreated}
      />
    </DashboardLayout>
  );
};

const AdvertisementsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <Advertisements />
  </ProtectedRoute>
);

export default AdvertisementsWithAuth;
