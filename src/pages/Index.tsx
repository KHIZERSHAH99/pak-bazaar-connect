
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveAds, Ad } from '@/lib/supabase';
import { Store, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const ads = await getActiveAds(3);
        setActiveAds(ads);
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };
    fetchAds();
  }, []);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pakistani-green-800 via-blue-600 to-pakistani-green-700 md:py-24 py-16 px-4 md:px-8 my-4 rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-500/20 blur-xl"></div>
          <div className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-green-300/20 to-teal-500/20 blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 mx-0 py-0 my-0 px-0 lg:text-5xl">
                Connect Wholesalers and Sellers Across Pakistan
              </h1>
              <p className="text-pakistani-green-100 text-lg mb-8 max-w-lg">
                Streamline your B2B operations with Pakistan's premier wholesale marketplace connecting suppliers and retailers.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button className="bg-white text-primary hover:bg-gray-100 group transition-all duration-300">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button className="bg-white text-primary hover:bg-gray-100 group transition-all duration-300">
                        Sign Up Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="text-white hover:bg-pakistani-green-700 bg-pakistani-green-800/40 border-white/30 backdrop-blur-sm hover:bg-green-800">
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://ndopdaifnmzdkdjsolbq.supabase.co/storage/v1/object/public/public/marketplace-illustration.svg"
                alt="B2B Marketplace"
                className="max-w-full h-auto drop-shadow-lg rounded-lg animate-fadeIn"
                onError={(e) => {
                  // Fallback to a high-quality placeholder image that matches our theme
                  e.currentTarget.src = "https://cdn.pixabay.com/photo/2018/04/02/11/08/business-3284034_1280.png";
                }}
                style={{
                  animation: 'fadeIn 0.6s ease-out',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <Store className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Wholesalers</h3>
              <p className="text-gray-600 mb-4">
                Create shops, list products, and connect with retailers across Pakistan. Expand your business reach.
              </p>
              {!user && (
                <Link to="/signup" className="text-primary font-medium hover:underline group flex items-center justify-center">
                  Register as Wholesaler 
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
              <p className="text-gray-600 mb-4">
                Find reliable wholesalers, browse products, and place orders efficiently to grow your retail business.
              </p>
              {!user && (
                <Link to="/signup" className="text-primary font-medium hover:underline group flex items-center justify-center">
                  Register as Seller
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Growth Platform</h3>
              <p className="text-gray-600 mb-4">
                Analytics, promotions, and support to help your business thrive in Pakistan's growing market.
              </p>
              {!user && (
                <Link to="/signup" className="text-primary font-medium hover:underline group flex items-center justify-center">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      {activeAds.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Promotions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeAds.map(ad => (
                <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  {ad.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={ad.image} 
                        alt={ad.headline} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Ad";
                        }} 
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{ad.headline}</h3>
                    {user ? (
                      <Link to="/dashboard/browse-shops" className="text-primary font-medium hover:underline group flex items-center">
                        Browse Shops
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <Link to="/signup" className="text-primary font-medium hover:underline group flex items-center">
                        Sign Up to View
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pakistani-green-900 to-blue-800 text-white rounded-3xl my-4 overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-green-300/10 to-teal-500/10 blur-xl"></div>
          <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-gradient-to-bl from-blue-300/10 to-purple-500/10 blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-pakistani-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Pak Bazaar Connect to streamline their wholesale operations.
          </p>
          {!user ? (
            <Link to="/signup">
              <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 group transition-all duration-300">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 group transition-all duration-300">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
