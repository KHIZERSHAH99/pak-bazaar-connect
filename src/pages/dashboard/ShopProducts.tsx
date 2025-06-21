
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  moq?: number;
  is_active: boolean;
  verification_status: string;
}

interface Shop {
  id: string;
  name: string;
  contact: string;
  address: string;
  logo?: string;
}

const ShopProducts: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchShopAndProducts();
    }
  }, [shopId]);

  const fetchShopAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch products for this shop
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching shop and products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderProduct = (productId: string) => {
    // Navigate to order form with product and shop info
    navigate(`/dashboard/order/${shopId}/${productId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!shop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Shop Not Found</h2>
          <Button onClick={() => navigate('/dashboard/browse-shops')}>
            Back to Browse Shops
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/browse-shops')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shops</span>
          </Button>
        </div>

        {/* Shop Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl font-poppins">{shop.name}</CardTitle>
                <p className="text-muted-foreground font-poppins">{shop.contact}</p>
                <p className="text-sm text-muted-foreground font-poppins">{shop.address}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Products Grid */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 font-poppins">
            Products ({products.length})
          </h2>
          
          {products.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Products Available</h3>
                <p className="text-muted-foreground">This shop hasn't added any products yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 font-poppins">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 font-poppins line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-primary font-poppins">
                        PKR {product.price.toLocaleString()}
                      </span>
                      {product.moq && product.moq > 1 && (
                        <Badge variant="outline">MOQ: {product.moq}</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleOrderProduct(product.id)}
                      className="w-full bg-primary hover:bg-primary/90 font-poppins"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const ShopProductsWithAuth = () => (
  <ProtectedRoute allowedRoles={['seller']}>
    <ShopProducts />
  </ProtectedRoute>
);

export default ShopProductsWithAuth;
