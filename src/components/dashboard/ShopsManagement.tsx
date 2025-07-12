import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CreateShopDialog from '@/components/shops/CreateShopDialog';
import { useAuth } from '@/contexts/AuthContextFixed';
import { supabase } from '@/integrations/supabase/client';
const ShopsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [hasExistingShop, setHasExistingShop] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    profile
  } = useAuth();
  useEffect(() => {
    checkExistingShops();
  }, [profile]);
  const checkExistingShops = async () => {
    if (!profile) return;
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data: shops,
        error
      } = await supabase.from('shops').select('id').eq('owner_id', user.id);
      if (error) {
        console.error('Error checking existing shops:', error);
        return;
      }
      setHasExistingShop((shops?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking shops:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleShopCreated = () => {
    console.log('Shop created successfully');
    checkExistingShops(); // Refresh the status
  };
  if (loading) {
    return <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Shops</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Shops</h1>
        {!hasExistingShop && <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shop
          </Button>}
      </div>

      {hasExistingShop}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Store className="w-5 h-5" />
            Shop Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasExistingShop ? <>
              <p className="text-gray-600 font-poppins mb-4">
                Create and manage your wholesale shop. Set up your product catalog, manage inventory, and track orders.
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-poppins text-sm">
                  💡 Start by creating your shop to begin selling products to retailers.
                </p>
              </div>
            </> : <>
              <p className="text-gray-600 font-poppins mb-4">
                Manage your wholesale shop operations. Add products, update inventory, and process orders.
              </p>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-poppins text-sm">
                  ✅ Your shop is active. Use the Products and Orders sections to manage your business.
                </p>
              </div>
            </>}
        </CardContent>
      </Card>

      <CreateShopDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onShopCreated={handleShopCreated} />
    </div>;
};
export default ShopsManagement;