
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Store, Package, Users, TrendingUp, ShoppingCart, Star, MapPin, Phone } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  shops?: {
    name: string;
    contact: string;
    address: string;
  };
  views_count?: number;
}

interface Shop {
  id: string;
  name: string;
  contact: string;
  address: string;
  logo?: string;
  products_count?: number;
}

interface Ad {
  id: string;
  headline: string;
  image?: string;
  status: string;
}

const Index: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured products with defensive handling
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image,
            description,
            shops!inner(name, contact, address)
          `)
          .eq('is_active', true)
          .eq('verification_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6);

        if (productsError) {
          console.error('Products fetch error:', productsError);
        } else {
          // Add product views count with fallback
          const productsWithViews = await Promise.all(
            (products || []).map(async (product) => {
              try {
                const { count } = await supabase
                  .from('product_views')
                  .select('*', { count: 'exact', head: true })
                  .eq('product_id', product.id);
                
                return {
                  ...product,
                  views_count: count || 0
                };
              } catch (error) {
                console.error('Views count error for product:', product.id, error);
                return {
                  ...product,
                  views_count: 0
                };
              }
            })
          );
          setFeaturedProducts(productsWithViews);
        }

        // Fetch featured shops with defensive handling
        const { data: shops, error: shopsError } = await supabase
          .from('shops')
          .select(`
            id,
            name,
            contact,
            address,
            logo
          `)
          .order('created_at', { ascending: false })
          .limit(4);

        if (shopsError) {
          console.error('Shops fetch error:', shopsError);
        } else {
          // Add product count for each shop with fallback
          const shopsWithCounts = await Promise.all(
            (shops || []).map(async (shop) => {
              try {
                const { count } = await supabase
                  .from('products')
                  .select('*', { count: 'exact', head: true })
                  .eq('shop_id', shop.id)
                  .eq('is_active', true);
                
                return {
                  ...shop,
                  products_count: count || 0
                };
              } catch (error) {
                console.error('Product count error for shop:', shop.id, error);
                return {
                  ...shop,
                  products_count: 0
                };
              }
            })
          );
          setFeaturedShops(shopsWithCounts);
        }

        // Fetch active ads with defensive handling
        const { data: ads, error: adsError } = await supabase
          .from('ads')
          .select('id, headline, image, status')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        if (adsError) {
          console.error('Ads fetch error:', adsError);
        } else {
          setActiveAds(ads || []);
        }

      } catch (error: any) {
        console.error('Homepage data fetch error:', error);
        setError('Failed to load homepage data. Please refresh the page.');
        toast({
          title: "Loading Error",
          description: "Some content may not be available. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header placeholder */}
        <div className="bg-pakistani_green-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        
        {/* Content placeholders */}
        <div className="container mx-auto px-4 py-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-pakistani_green-50 to-pakistani_green-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-pakistani_green-800 mb-6">
            Pakistan's Leading B2B Marketplace
          </h1>
          <p className="text-xl text-pakistani_green-700 mb-8 max-w-2xl mx-auto">
            Connect wholesalers and retailers across Pakistan. Grow your business with verified suppliers and quality products.
          </p>
          
          {/* Call-to-Action Banner */}
          <div className="bg-pakistani_green-600 text-white p-6 rounded-lg mb-8 inline-block">
            <h2 className="text-2xl font-bold mb-2">🎉 Join Now! Free Ads for First 10 Wholesalers!</h2>
            <p className="text-pakistani_green-100">Limited time offer - Start selling today</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white px-8 py-3 text-lg">
                Start Selling
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 px-8 py-3 text-lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-red-800 font-semibold mb-2">Content Loading Issue</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )}

      {/* Active Ads Section */}
      {activeAds.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pakistani_green-800">Featured Promotions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeAds.map((ad) => (
                <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {ad.image && (
                      <img 
                        src={ad.image} 
                        alt={ad.headline}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <h3 className="font-semibold text-lg text-pakistani_green-800">{ad.headline}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-pakistani_green-800">Featured Products</h2>
          
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
              <p className="text-gray-500 mb-6">Be the first to list your products on our platform</p>
              <Link to="/signup">
                <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white">
                  Start Selling
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/300/200';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-pakistani_green-600">
                        {product.views_count || 0} views
                      </Badge>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-pakistani_green-800">{product.name}</h3>
                      <p className="text-2xl font-bold text-pakistani_green-600 mb-3">
                        PKR {product.price.toLocaleString()}
                      </p>
                      
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      )}
                      
                      {product.shops && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Store className="h-4 w-4" />
                            <span className="font-medium">{product.shops.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{product.shops.address}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-pakistani_green-800">Featured Wholesalers</h2>
          
          {featuredShops.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shops Available</h3>
              <p className="text-gray-500 mb-6">Join our platform to showcase your business</p>
              <Link to="/signup">
                <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white">
                  Register Your Shop
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredShops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name}
                          className="w-16 h-16 object-cover rounded-full mx-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-pakistani_green-100 rounded-full mx-auto flex items-center justify-center">
                          <Store className="h-8 w-8 text-pakistani_green-600" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 text-pakistani_green-800">{shop.name}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{shop.contact}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{shop.address}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{shop.products_count || 0} products</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pakistani_green-600">{featuredShops.length}+</div>
              <div className="text-gray-600">Verified Wholesalers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pakistani_green-600">{featuredProducts.length}+</div>
              <div className="text-gray-600">Quality Products</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pakistani_green-600">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pakistani_green-600">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">&copy; 2024 Pakistan B2B Marketplace. All rights reserved.</p>
          <p className="text-pakistani_green-200">Build Successful, API Keys Secured</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
