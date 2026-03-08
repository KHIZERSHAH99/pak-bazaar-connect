import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Store, Package, ImageIcon, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const AdminModeration: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shopSearch, setShopSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Pending Ads
  const { data: pendingAds = [], isLoading: adsLoading } = useQuery({
    queryKey: ['admin-pending-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // All Shops
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-all-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // All Products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const updateAdStatus = useMutation({
    mutationFn: async ({ adId, status }: { adId: string; status: string }) => {
      const { error } = await supabase.from('ads').update({ status }).eq('id', adId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Ad status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-ads'] });
      queryClient.invalidateQueries({ queryKey: ['pending-ads-count'] });
    },
  });

  const toggleProductActive = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
    },
  });

  const filteredShops = shops.filter((s: any) =>
    !shopSearch || s.name?.toLowerCase().includes(shopSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p: any) =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.shops?.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/dashboard/admin' },
        { label: 'Moderation' }
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">Content Moderation</h1>
        <p className="text-muted-foreground font-poppins">Review ads, moderate shops, and manage products</p>
      </div>

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ads" className="gap-2">
            <ImageIcon className="h-4 w-4" /> Ads
            {pendingAds.length > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{pendingAds.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="shops" className="gap-2">
            <Store className="h-4 w-4" /> Shops
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" /> Products
          </TabsTrigger>
        </TabsList>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-4">
          {adsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : pendingAds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium font-poppins">All caught up!</p>
                <p className="text-sm text-muted-foreground font-poppins">No pending ads to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingAds.map((ad: any) => (
                <Card key={ad.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {ad.image && (
                        <img src={ad.image} alt={ad.headline} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium font-poppins">{ad.headline}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {format(new Date(ad.created_at), 'MMM d, yyyy')}
                        </p>
                        {ad.budget_cap && <p className="text-xs text-muted-foreground">Budget: Rs {ad.budget_cap}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => updateAdStatus.mutate({ adId: ad.id, status: 'active' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAdStatus.mutate({ adId: ad.id, status: 'rejected' })}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search shops..." value={shopSearch} onChange={(e) => setShopSearch(e.target.value)} className="pl-10" />
          </div>
          {shopsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {filteredShops.map((shop: any) => (
                  <div key={shop.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {shop.logo ? (
                        <img src={shop.logo} alt={shop.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate font-poppins">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.profiles?.email} · {shop.city || 'No city'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {format(new Date(shop.created_at), 'MMM d')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-10" />
          </div>
          {productsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate font-poppins">{product.name}</p>
                          <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[10px]">
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rs {Number(product.price || 0).toLocaleString()} · {product.shops?.name || 'Unknown Shop'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={product.is_active ? 'destructive' : 'default'}
                      onClick={() => toggleProductActive.mutate({ productId: product.id, isActive: !product.is_active })}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
