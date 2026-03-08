
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Store, MapPin, Phone, Star } from 'lucide-react';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: shop, isLoading, error } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!shopId) throw new Error('Shop ID is required');
      
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          cities!city_id (
            name,
            province
          )
        `)
        .eq('id', shopId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (
            name
          )
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !shop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Shop Not Found</h2>
          <p className="text-muted-foreground mb-4">The shop you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard/shops')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/dashboard/shops')} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
            <h1 className="text-2xl font-bold text-foreground font-poppins">{shop.name}</h1>
          </div>
          <Badge variant="success" className="font-poppins">
            Active Shop
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                {shop.logo ? (
                  <img 
                    src={shop.logo} 
                    alt={shop.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-poppins">{shop.name}</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-poppins">{shop.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="font-poppins">{shop.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground font-poppins flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Products ({products?.length || 0})
                </h3>
                <Button 
                  onClick={() => navigate('/dashboard/products')} 
                  size="sm"
                >
                  Manage Products
                </Button>
              </div>
              
              {productsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate font-poppins">{product.name}</h4>
                          <p className="text-sm text-muted-foreground font-poppins">Rs. {product.price}</p>
                          {product.categories && (
                            <Badge variant="secondary" size="sm" className="mt-1">
                              {product.categories?.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-poppins">No products added yet</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 font-poppins">Shop Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-poppins">Total Products</span>
                  <span className="font-semibold font-poppins">{products?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-poppins">Commission Rate</span>
                  <span className="font-semibold font-poppins">{shop.commission_rate || 5}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-poppins">Shop Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold ml-1 font-poppins">4.5</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppins">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/dashboard/products')}>
                  Add New Product
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/ads')}>
                  Create Advertisement
                </Button>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ShopDetailsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <ShopDetails />
  </ProtectedRoute>
);

export default ShopDetailsWithAuth;
