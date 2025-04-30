
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductsByShop, Product, Shop, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Package, Store, ShoppingCart, ArrowLeft } from 'lucide-react';

const ShopProducts: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchShopDetails = async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      
      // Get shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();
      
      if (shopError) throw shopError;
      setShop(shopData);
      
      // Get shop products
      const productsData = await getProductsByShop(shopId);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch shop details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shop details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  const handleAddToCart = (productId: string) => {
    // To be implemented in the future
    toast({
      title: 'Feature Coming Soon',
      description: 'Shopping cart functionality will be available in the next update',
    });
  };

  if (!shopId) {
    return (
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Invalid Shop</h1>
          <p className="text-gray-600">Shop ID is missing. Please go back and select a shop.</p>
          <Link to="/dashboard/browse-shops">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shops
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <Link to="/dashboard/browse-shops" className="inline-flex items-center text-gray-600 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shops
          </Link>
          
          {loading ? (
            <h1 className="text-2xl font-bold text-gray-800">Loading Shop...</h1>
          ) : shop ? (
            <div className="flex items-center">
              <div className="h-12 w-12 bg-pakistani-green-100 rounded-full flex items-center justify-center mr-4">
                {shop.logo ? (
                  <img 
                    src={shop.logo} 
                    alt={shop.name} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
                <p className="text-gray-600">{shop.address}</p>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">Shop Not Found</h1>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No products available</h3>
            <p className="text-gray-600">
              This shop hasn't listed any products yet.
            </p>
          </Card>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="h-48 bg-gray-100">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Product";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    
                    {product.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    
                    <p className="text-lg font-bold text-primary mb-4">
                      PKR {product.price.toLocaleString()}
                    </p>

                    <Button 
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full bg-primary hover:bg-pakistani-green-800"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
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
