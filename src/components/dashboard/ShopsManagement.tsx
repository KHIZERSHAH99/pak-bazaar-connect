
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Edit, MapPin, Phone, Package } from 'lucide-react';
import { Shop } from '@/lib/types';
import { getShopsByOwner } from '@/lib/shops';
import { useToast } from '@/hooks/use-toast';
import CreateShopDialog from '@/components/shops/CreateShopDialog';
import EditShopDialog from '@/components/shops/EditShopDialog';
import { useQuery } from '@tanstack/react-query';

const ShopsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const { toast } = useToast();

  const { data: shops = [], isLoading, refetch } = useQuery({
    queryKey: ['user-shops'],
    queryFn: getShopsByOwner,
  });

  const handleShopCreated = () => {
    refetch();
    toast({
      title: "Shop created",
      description: "Your shop has been created successfully.",
    });
  };

  const handleShopUpdated = () => {
    refetch();
    setSelectedShop(null);
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

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

      {shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">
              No shops yet
            </h3>
            <p className="text-gray-600 mb-4 font-poppins text-center">
              Create your first shop to start selling products on our platform.
            </p>
            <Button 
              className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Shop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {shop.logo && (
                <div className="aspect-video relative">
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-poppins text-xl">{shop.name}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditShop(shop)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-poppins">{shop.contact}</span>
                </div>
                
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-1" />
                  <div className="font-poppins">
                    <p>{shop.address}</p>
                    <p className="text-sm">Postal Code: {shop.postal_code}</p>
                    {shop.cities && (
                      <p className="text-sm">{shop.cities.name}, {shop.cities.province}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary" className="font-poppins">
                    <Package className="w-3 h-3 mr-1" />
                    {shop.commission_rate || 5}% Commission
                  </Badge>
                  
                  {shop.is_verified && (
                    <Badge className="bg-green-100 text-green-800 font-poppins">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateShopDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onShopCreated={handleShopCreated}
      />

      <EditShopDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        shop={selectedShop}
        onShopUpdated={handleShopUpdated}
      />
    </div>
  );
};

export default ShopsManagement;
