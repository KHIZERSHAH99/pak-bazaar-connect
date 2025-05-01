import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveAds, Ad } from '@/lib/supabase';
import { Store, ShoppingBag, TrendingUp, ArrowRight, Package, UserCheck, Building } from 'lucide-react';
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
      <section className="bg-gradient-to-r from-pakistani_green-800 to-pakistani_green-700 py-16 md:py-24 px-4 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Pakistan's Premier B2B Marketplace
              </h1>
              <p className="text-white/90 text-lg mb-8 max-w-lg">
                Connect with trusted wholesalers and retailers across Pakistan. Streamline your business operations and grow your network with Pak Bazaar Connect.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? <Link to="/dashboard">
                    <Button className="bg-white text-pakistani_green-800 hover:bg-gray-100 font-medium text-base py-6 px-8 rounded-md shadow-lg group transition-all duration-300">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link> : <>
                    <Link to="/signup">
                      <Button className="bg-white text-pakistani_green-800 hover:bg-gray-100 font-medium text-base py-6 px-8 rounded-md shadow-lg group transition-all duration-300">
                        Sign Up Now
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="border-white border-2 font-medium text-base py-6 px-8 rounded-md text-zinc-50 bg-emerald-950 hover:bg-emerald-800">
                        Login
                      </Button>
                    </Link>
                  </>}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                <img src="https://lljiqniebnmfbytbkjkv.supabase.co/storage/v1/object/public/public/marketplace-illustration.png" alt="B2B Marketplace" className="max-w-full h-auto relative z-10 drop-shadow-2xl" onError={e => {
                e.currentTarget.src = "https://cdn.pixabay.com/photo/2018/04/02/11/08/business-3284034_1280.png";
              }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-pakistani_green-800 p-4 my-6 rounded-lg text-center font-medium shadow-md animate-pulse">
        <span className="font-bold">Special Offer:</span> Join Now! Free Ads for First 10 Wholesalers!
      </div>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How Pak Bazaar Connect Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Our platform is designed to connect businesses efficiently across Pakistan's marketplace</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani_green-100 p-4 rounded-full">
                  <Building className="h-8 w-8 text-pakistani_green-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Wholesalers</h3>
              <p className="text-gray-600 mb-4">
                Create shops, list products, and connect with retailers across Pakistan. Track orders and manage your inventory seamlessly.
              </p>
              {!user && <Link to="/signup" className="text-pakistani_green-700 font-medium hover:underline group flex items-center justify-center">
                  Register as Wholesaler 
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>}
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani_green-100 p-4 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-pakistani_green-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
              <p className="text-gray-600 mb-4">
                Discover reliable wholesalers, browse quality products, and place orders with confidence to grow your retail business.
              </p>
              {!user && <Link to="/signup" className="text-pakistani_green-700 font-medium hover:underline group flex items-center justify-center">
                  Register as Seller
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>}
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani_green-100 p-4 rounded-full">
                  <TrendingUp className="h-8 w-8 text-pakistani_green-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Growth</h3>
              <p className="text-gray-600 mb-4">
                Access analytics, create promotions, and get support to help your business thrive in Pakistan's growing marketplace.
              </p>
              {!user && <Link to="/signup" className="text-pakistani_green-700 font-medium hover:underline group flex items-center justify-center">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>}
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-pakistani_green-700">1,000+</p>
              <p className="text-gray-600">Wholesalers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-pakistani_green-700">5,000+</p>
              <p className="text-gray-600">Sellers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-pakistani_green-700">10k+</p>
              <p className="text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-pakistani_green-700">32</p>
              <p className="text-gray-600">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      {activeAds.length > 0 && <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Featured Promotions</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Discover exclusive offers from top wholesalers across Pakistan</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeAds.map(ad => <Card key={ad.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md rounded-xl">
                  {ad.image && <div className="h-48 overflow-hidden">
                      <img src={ad.image} alt={ad.headline} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" onError={e => {
                e.currentTarget.src = "https://via.placeholder.com/300x200?text=Ad";
              }} />
                    </div>}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{ad.headline}</h3>
                    {user ? <Link to="/dashboard/browse-shops" className="text-pakistani_green-700 font-medium hover:underline group flex items-center">
                        Browse Shops
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link> : <Link to="/signup" className="text-pakistani_green-700 font-medium hover:underline group flex items-center">
                        Sign Up to View
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>}
                  </div>
                </Card>)}
            </div>
          </div>
        </section>}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pakistani_green-900 to-pakistani_green-700 text-white rounded-xl mb-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid-cta" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-cta)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Pak Bazaar Connect to streamline their wholesale operations.
          </p>
          {!user ? <Link to="/signup">
              <Button className="bg-white text-pakistani_green-800 hover:bg-gray-100 font-medium text-base py-6 px-8 rounded-md shadow-lg group transition-all duration-300">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link> : <Link to="/dashboard">
              <Button className="bg-white text-pakistani_green-800 hover:bg-gray-100 font-medium text-base py-6 px-8 rounded-md shadow-lg group transition-all duration-300">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>}
        </div>
      </section>
    </Layout>;
};
export default Index;