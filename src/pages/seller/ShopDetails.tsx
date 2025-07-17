import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ProductCard from '@/components/products/ProductCard';
import { getShopById, getProductsByShopPublic } from '@/lib/marketplace';
import { Shop, Product } from '@/lib/types';
import { Store, Package, MapPin, Phone, ArrowLeft, Star } from 'lucide-react';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      setProductsLoading(true);
      
      const [shopData, productsData] = await Promise.all([
        getShopById(shopId),
        getProductsByShopPublic(shopId)
      ]);
      
      setShop(shopData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch shop details:', error);
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Loading shop details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!shop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2 font-poppins">Shop not found</h2>
          <p className="text-muted-foreground font-poppins">The shop you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/browse-shops">
            <Button className="mt-4 bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/dashboard/browse-shops">
          <Button variant="ghost" className="text-pakistani_green-600 hover:text-pakistani_green-700 font-poppins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
        </Link>

        {/* Shop Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-pakistani_green-500 to-pakistani_green-600 text-white p-8">
            <div className="flex items-start gap-6">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white/20 flex-shrink-0">
                {shop.logo ? (
                  <img 
                    src={shop.logo} 
                    alt={shop.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Store className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold font-poppins mb-2">{shop.name}</h1>
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="font-poppins">{shop.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-poppins">{shop.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-poppins">
                      Verified Supplier
                    </Badge>
                    {shop.avg_rating > 0 && (
                      <div className="flex items-center mt-2 text-white/90">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span className="font-poppins">{shop.avg_rating.toFixed(1)}</span>
                        <span className="ml-1 text-sm">({shop.total_reviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-poppins">
              Products from {shop.name}
            </h2>
            <Badge variant="outline" className="font-poppins">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </Badge>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">No products available</h3>
              <p className="text-muted-foreground font-poppins">
                This shop doesn't have any products listed at the moment.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const ShopDetailsWithAuth = () => (
  <ProtectedRoute allowedRoles={['seller']}>
    <ShopDetails />
  </ProtectedRoute>
);

export default ShopDetailsWithAuth;