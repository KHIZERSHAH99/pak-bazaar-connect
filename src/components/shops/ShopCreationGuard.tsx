
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContextFixed';
import { supabase } from '@/integrations/supabase/client';
import { Store, AlertCircle, CheckCircle } from 'lucide-react';
import CreateShopDialog from './CreateShopDialog';

interface ShopCreationGuardProps {
  onShopCreated?: () => void;
}

const ShopCreationGuard: React.FC<ShopCreationGuardProps> = ({ onShopCreated }) => {
  const [hasExistingShop, setHasExistingShop] = useState(false);
  const [existingShop, setExistingShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    checkExistingShops();
  }, [profile]);

  const checkExistingShops = async () => {
    if (!profile || profile.role !== 'wholesaler') {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id);

      if (shopsError) {
        throw shopsError;
      }

      if (shops && shops.length > 0) {
        setHasExistingShop(true);
        setExistingShop(shops[0]);
      } else {
        setHasExistingShop(false);
        setExistingShop(null);
      }
    } catch (error: any) {
      console.error('Error checking existing shops:', error);
      setError(error.message || 'Failed to check existing shops');
    } finally {
      setLoading(false);
    }
  };

  const handleShopCreated = () => {
    setIsCreateDialogOpen(false);
    checkExistingShops(); // Refresh the status
    onShopCreated?.();
  };

  const handleCreateShop = async () => {
    // Double-check before allowing shop creation
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: existingShops, error } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (error) {
        throw error;
      }

      if (existingShops && existingShops.length > 0) {
        setError('You already have a shop. Each wholesaler can only have one shop.');
        setHasExistingShop(true);
        return;
      }

      setIsCreateDialogOpen(true);
    } catch (error: any) {
      console.error('Error checking shop limit:', error);
      setError(error.message || 'Failed to verify shop creation eligibility');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profile?.role !== 'wholesaler') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Shop creation is only available for wholesaler accounts.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {hasExistingShop ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p><strong>Shop Active:</strong> {existingShop?.name}</p>
              <p className="text-sm">You already have an active shop. Each wholesaler can only manage one shop to ensure quality and focus.</p>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Create Your Wholesale Shop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Set up your wholesale shop to start selling products to retailers across Pakistan.
            </p>
            
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>One Shop Policy:</strong> Each wholesaler can create only one shop to maintain quality standards and focused business operations.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleCreateShop}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700 w-full"
            >
              <Store className="h-4 w-4 mr-2" />
              Create My Shop
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateShopDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onShopCreated={handleShopCreated}
      />
    </div>
  );
};

export default ShopCreationGuard;
