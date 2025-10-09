import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShippingConfigManager from '@/components/shipping/ShippingConfigManager';
import { Package } from 'lucide-react';

const ShippingManagement: React.FC = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, [user]);

  const fetchShops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;
      setShops(data || []);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading shops...</CardContent>
      </Card>
    );
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You don't have any shops yet. Create a shop first to configure shipping.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shops.length === 1) {
    return <ShippingConfigManager shopId={shops[0].id} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={shops[0].id}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${shops.length}, 1fr)` }}>
            {shops.map((shop) => (
              <TabsTrigger key={shop.id} value={shop.id}>
                {shop.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {shops.map((shop) => (
            <TabsContent key={shop.id} value={shop.id}>
              <ShippingConfigManager shopId={shop.id} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShippingManagement;
