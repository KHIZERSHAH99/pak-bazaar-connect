
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getMarketplaceProducts, getCategories, getMarketplaceShops } from '@/lib/marketplace';
import { Product, Category, Shop } from '@/lib/types';
import { ArrowRight, Store, Package, Users, Search, MapPin, Star } from 'lucide-react';

const Index: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsData, categoriesData, shopsData] = await Promise.all([
        getMarketplaceProducts({ limit: 8 }),
        getCategories(),
        getMarketplaceShops({ limit: 6 }),
      ]);
      
      setFeaturedProducts(productsData);
      setCategories(categoriesData);
      setFeaturedShops(shopsData);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-pakistani-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins">
              Pakistan's Leading B2B Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-poppins">
              Connect with verified wholesalers and retailers. Discover products, build relationships, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-poppins text-lg px-8 py-3">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link to="/sellers">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-poppins text-lg px-8 py-3">
                  <Store className="h-5 w-5 mr-2" />
                  Find Suppliers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">{featuredProducts.length}+</h3>
              <p className="text-gray-600 font-poppins">Quality Products</p>
            </div>
            <div>
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">{featuredShops.length}+</h3>
              <p className="text-gray-600 font-poppins">Verified Suppliers</p>
            </div>
            <div>
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">1000+</h3>
              <p className="text-gray-600 font-poppins">Active Buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Browse by Category</h2>
            <p className="text-gray-600 font-poppins">Explore products across various industries</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.slice(0, 10).map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.id}`}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 font-poppins text-sm">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Featured Products</h2>
              <p className="text-gray-600 font-poppins">Discover top-selling products from verified suppliers</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="font-poppins">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
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
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 font-poppins line-clamp-2">{product.name}</h3>
                      
                      {product.categories && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {product.categories.name}
                        </span>
                      )}
                      
                      <p className="text-xl font-bold text-primary mb-2 font-poppins">
                        PKR {product.price.toLocaleString()}
                      </p>
                      
                      {product.shops && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-sm text-gray-600 font-poppins">{product.shops.name}</p>
                          {product.shops.cities && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="font-poppins">{product.shops.cities.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Suppliers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Featured Suppliers</h2>
              <p className="text-gray-600 font-poppins">Connect with trusted wholesale suppliers</p>
            </div>
            <Link to="/sellers">
              <Button variant="outline" className="font-poppins">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredShops.map((shop) => (
              <Link key={shop.id} to={`/seller/${shop.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="h-24 bg-gradient-to-r from-primary to-pakistani-green-600 relative">
                    {shop.company_profiles?.logo ? (
                      <img 
                        src={shop.company_profiles.logo} 
                        alt={shop.name} 
                        className="absolute bottom-2 left-4 h-12 w-12 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div className="absolute bottom-2 left-4 h-12 w-12 rounded-full border-2 border-white bg-white flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 pt-6">
                    <h3 className="font-bold text-lg mb-2 font-poppins">
                      {shop.company_profiles?.company_name || shop.name}
                    </h3>
                    
                    {shop.company_profiles?.description && (
                      <p className="text-gray-600 mb-3 font-poppins text-sm line-clamp-2">
                        {shop.company_profiles.description}
                      </p>
                    )}
                    
                    {shop.cities && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="font-poppins">{shop.cities.name}, {shop.cities.province}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="text-sm font-poppins">Verified</span>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-pakistani-green-800">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-poppins">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 font-poppins">
            Join thousands of businesses already using our platform to grow their trade network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-poppins">
                <Users className="h-5 w-5 mr-2" />
                Join as Buyer
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-poppins">
                <Store className="h-5 w-5 mr-2" />
                Become a Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
