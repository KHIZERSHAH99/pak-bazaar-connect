import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Store, MapPin, Phone, Package, Star } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Layout from '@/components/Layout';

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
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  if (shopLoading) {
    return (
      <Layout title="Shop Details - Pak Bazaar Connect">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout title="Shop Not Found - Pak Bazaar Connect">
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
    <Layout title={`${shop.name} - Pak Bazaar Connect`}>
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
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {shop.logo ? (
                    <img 
                      src={shop.logo} 
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                        {shop.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-primary">
                          <Store className="h-3 w-3 mr-1" />
                          Verified Wholesaler
                        </Badge>
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          4.8 Rating
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">{shop.contact}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <div>
                        <div>{shop.address}</div>
                        {shop.postal_code && (
                          <div className="text-sm text-primary font-medium mt-1">
                            Postal Code: {shop.postal_code}
                          </div>
                        )}
                      </div>
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
                    <ProductCard key={product.id} product={product} />
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
