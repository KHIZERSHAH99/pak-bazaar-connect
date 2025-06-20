
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus } from 'lucide-react';
import CreateShopDialog from '@/components/shops/CreateShopDialog';

const ShopsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleShopCreated = () => {
    // Refresh shops list if needed
    console.log('Shop created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Shops</h1>
        <Button 
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Shop
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Store className="w-5 h-5" />
            Shop Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Create and manage your wholesale shops. Set up your product catalog, manage inventory, and track orders.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-poppins text-sm">
              💡 Start by creating your first shop to begin selling products to retailers.
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateShopDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onShopCreated={handleShopCreated}
      />
    </div>
  );
};

export default ShopsManagement;
