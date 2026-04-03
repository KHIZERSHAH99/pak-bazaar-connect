import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Store, MapPin, Phone, Package, Calendar, ShoppingCart, MessageSquare } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Layout from '@/components/Layout';
import MessageButton from '@/components/messaging/MessageButton';
import { format } from 'date-fns';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!shopId) throw new Error('Shop ID is required');
      
      const { data, error } = await supabase
        .from('shops')
        .select('*')
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
      if (!shopId) throw new Error('Shop ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories!products_category_id_fkey(name)')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  // Fetch order count for this shop
  const { data: orderCount } = useQuery({
    queryKey: ['shop-order-count', shopId],
    queryFn: async () => {
      if (!shopId) return 0;
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .in('status', ['confirmed', 'shipped', 'delivered']);
      return count || 0;
    },
    enabled: !!shopId,
  });

  if (shopLoading) {
    return (
      <Layout title="Shop Details - PakMandi">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout title="Shop Not Found - PakMandi">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
            <Button onClick={() => navigate('/shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${shop.name} - PakMandi`}>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={() => navigate('/shops')} 
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Shops
          </Button>

          <Card className="mb-8">
            <CardHeader className="relative pb-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {shop.logo ? (
                    <img 
                      src={shop.logo} 
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-3xl font-bold text-foreground mb-2 font-poppins">
                        {shop.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge className="bg-primary text-primary-foreground">
                          <Store className="h-3 w-3 mr-1" />
                          Verified Wholesaler
                        </Badge>
                      </div>
                    </div>
                    {shop.owner_id && (
                      <MessageButton sellerId={shop.owner_id} sellerName={shop.name} />
                    )}
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium font-poppins">{shop.contact}</span>
                    </div>
                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-sm font-poppins">{shop.address}{shop.postal_code ? ` (${shop.postal_code})` : ''}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm font-poppins">Since {format(new Date(shop.created_at), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground font-poppins">{products?.length || 0}</p>
                      <p className="text-xs text-muted-foreground font-poppins">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground font-poppins">{orderCount || 0}</p>
                      <p className="text-xs text-muted-foreground font-poppins">Orders Fulfilled</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products ({products?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No products available at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ShopDetails;
