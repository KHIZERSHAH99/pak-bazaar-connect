
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HeroSection: React.FC = () => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const isAuthenticated = !!session?.user;

  return (
    <div className="relative bg-gradient-to-br from-pakistani_green-50 to-white dark:from-pakistani_green-900/20 dark:to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white font-poppins leading-tight">
                Pakistan's Leading
                <span className="text-pakistani_green-600 dark:text-pakistani_green-400"> B2B </span>
                Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins leading-relaxed">
                Connect wholesalers and retailers across Pakistan. Grow your business with our trusted platform featuring secure payments and nationwide delivery.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-pakistani_green-100 dark:bg-pakistani_green-900/30 rounded-full mx-auto mb-2">
                  <Users className="w-6 h-6 text-pakistani_green-600 dark:text-pakistani_green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Active Users</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-2">
                  <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Products</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">₨2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Monthly Volume</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins w-full sm:w-auto">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-900/20 font-poppins w-full sm:w-auto"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins w-full sm:w-auto">
                      Start Selling
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-900/20 font-poppins w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Verified Suppliers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-poppins">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <div className="aspect-square bg-gradient-to-br from-pakistani_green-100 to-pakistani_green-200 dark:from-pakistani_green-900/30 dark:to-pakistani_green-800/30 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-pakistani_green-600 dark:bg-pakistani_green-500 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
                    Connect & Trade
                  </h3>
                  <p className="text-pakistani_green-700 dark:text-pakistani_green-300 font-poppins">
                    Join Pakistan's fastest growing B2B network
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-pakistani_green-200 dark:bg-pakistani_green-800 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-pakistani_green-600 dark:bg-pakistani_green-700 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="font-poppins font-medium">
              🎉 <strong>Special Launch Offer:</strong> Free Ads for First 10 Wholesalers! 
              <span className="ml-2 text-pakistani_green-100">Limited Time Only</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
