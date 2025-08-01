import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shop, Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Store, MapPin, Phone, Package, Star, Users, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
const ShopDetails: React.FC = () => {
  const {
    shopId
  } = useParams<{
    shopId: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const fetchShop = async () => {
    if (!shopId) return;
    try {
      const {
        data,
        error
      } = await supabase.from('shops').select(`
          *,
          cities!shops_city_id_fkey (
            id,
            name,
            province
          )
        `).eq('id', shopId).single();
      if (error) throw error;
      setShop(data);
    } catch (error: any) {
      console.error('Failed to fetch shop:', error);
      toast({
        title: "Error loading shop",
        description: error.message || "Failed to load shop details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchProducts = async () => {
    if (!shopId) return;
    try {
      setProductsLoading(true);
      const {
        data,
        error
      } = await supabase.from('products').select(`
          *,
          shops!products_shop_id_fkey (
            id,
            name,
            contact,
            address,
            postal_code,
            logo,
            owner_id,
            cities!shops_city_id_fkey (
              id,
              name,
              province
            )
          ),
          categories!products_category_id_fkey (
            id,
            name,
            description
          )
        `).eq('shop_id', shopId).eq('is_active', true).eq('verification_status', 'approved').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      console.log('Fetched products for shop:', data);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load shop products.",
        variant: "destructive"
      });
    } finally {
      setProductsLoading(false);
    }
  };
  useEffect(() => {
    fetchShop();
    fetchProducts();
  }, [shopId]);
  const getShopImageSrc = (logo?: string) => {
    if (logo && !logo.includes('placeholder.svg')) {
      return logo;
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
  };
  if (loading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading shop details..." />
        </div>
      </DashboardLayout>;
  }
  if (!shop) {
    return <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Shop Not Found</h2>
          <p className="text-gray-600 mb-6">The shop you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/seller/browse-shops')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse Shops
          </Button>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate('/seller/browse-shops')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse Shops
        </Button>

        {/* Shop Header */}
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            <img src={getShopImageSrc(shop.logo)} alt={shop.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-gray-800 shadow-sm">
                <Store className="h-3 w-3 mr-1" />
                Verified Shop
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-white shadow-sm">
                <Star className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          </div>
          
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 font-poppins">
              {shop.name}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <span className="font-poppins">{shop.contact}</span>
              </div>
              
              <div className="flex items-start text-gray-600">
                <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                <div className="font-poppins">
                  <div>{shop.address}</div>
                  {shop.cities && <div className="text-sm text-primary font-medium mt-1">
                      {shop.cities.name}, {shop.cities.province}
                    </div>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <Package className="h-4 w-4 mr-2" />
                <span>{products.length} Products</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                <span>Fresh Start</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 font-poppins flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? <div className="flex justify-center items-center py-8">
                <LoadingSpinner text="Loading products..." />
              </div> : products.length === 0 ? <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No Products Available</h3>
                <p className="text-gray-600 font-poppins">
                  This shop doesn't have any products listed yet.
                </p>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
};
export default ShopDetails;