import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveAds, Ad } from '@/lib/supabase';
import { Store, ShoppingBag, TrendingUp } from 'lucide-react';
const Index: React.FC = () => {
  const {
    user
  } = useAuth();
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
  return <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pakistani-green-800 to-pakistani-green-900 md:py-24 mx-[33px] py-[93px] px-[24px] my-[7px] rounded-3xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 mx-0 py-0 my-0 px-0 lg:text-5xl">
                Connect Wholesalers and Sellers Across Pakistan
              </h1>
              <p className="text-pakistani-green-100 text-lg mb-8 max-w-lg">
                Streamline your B2B operations with Pakistan's premier wholesale marketplace connecting suppliers and retailers.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? <Link to="/dashboard">
                    <Button className="bg-white text-primary hover:bg-gray-100">
                      Go to Dashboard
                    </Button>
                  </Link> : <>
                    <Link to="/signup">
                      <Button className="bg-white text-primary hover:bg-gray-100">
                        Sign Up Now
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="text-white hover:bg-pakistani-green-700 bg-green-950 hover:bg-green-800">
                        Login
                      </Button>
                    </Link>
                  </>}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="https://lljiqniebnmfbytbkjkv.supabase.co/storage/v1/object/public/public/hero-image.svg" alt="B2B Marketplace" className="max-w-full h-auto" onError={e => {
              e.currentTarget.src = "https://via.placeholder.com/500x400?text=Pak+Bazaar+Connect";
            }} />
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <div className="bg-yellow-100 py-3">
        <div className="container mx-auto px-4">
          <p className="text-center text-yellow-800 font-medium">
            Join Now! Free Ads for First 10 Wholesalers!
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <Store className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Wholesalers</h3>
              <p className="text-gray-600 mb-4">
                Create shops, list products, and connect with retailers across Pakistan. Expand your business reach.
              </p>
              {!user && <Link to="/signup" className="text-primary font-medium hover:underline">
                  Register as Wholesaler →
                </Link>}
            </Card>
            
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
              <p className="text-gray-600 mb-4">
                Find reliable wholesalers, browse products, and place orders efficiently to grow your retail business.
              </p>
              {!user && <Link to="/signup" className="text-primary font-medium hover:underline">
                  Register as Seller →
                </Link>}
            </Card>
            
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Growth Platform</h3>
              <p className="text-gray-600 mb-4">
                Analytics, promotions, and support to help your business thrive in Pakistan's growing market.
              </p>
              {!user && <Link to="/signup" className="text-primary font-medium hover:underline">
                  Learn More →
                </Link>}
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      {activeAds.length > 0 && <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Promotions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeAds.map(ad => <Card key={ad.id} className="overflow-hidden">
                  {ad.image && <div className="h-48 overflow-hidden">
                      <img src={ad.image} alt={ad.headline} className="w-full h-full object-cover" onError={e => {
                e.currentTarget.src = "https://via.placeholder.com/300x200?text=Ad";
              }} />
                    </div>}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{ad.headline}</h3>
                    {user ? <Link to="/dashboard/browse-shops" className="text-primary font-medium hover:underline">
                        Browse Shops →
                      </Link> : <Link to="/signup" className="text-primary font-medium hover:underline">
                        Sign Up to View →
                      </Link>}
                  </div>
                </Card>)}
            </div>
          </div>
        </section>}

      {/* CTA Section */}
      <section className="py-16 bg-pakistani-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-pakistani-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Pak Bazaar Connect to streamline their wholesale operations.
          </p>
          {!user ? <Link to="/signup">
              <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
                Get Started Now
              </Button>
            </Link> : <Link to="/dashboard">
              <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>}
        </div>
      </section>
    </Layout>;
};
export default Index;