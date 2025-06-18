
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, ShoppingBag, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-pakistani_green-50 via-white to-pakistani_green-100 dark:from-pakistani_green-950 dark:via-gray-900 dark:to-pakistani_green-900 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight font-poppins">
                Pakistan's Leading{' '}
                <span className="text-pakistani_green-600 dark:text-pakistani_green-400">
                  B2B Marketplace
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-poppins">
                Connect wholesalers and retailers across Pakistan. Discover quality products, 
                build lasting business relationships, and grow your business with trusted suppliers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-poppins">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">5K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-poppins">Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-poppins">Cities</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins shadow-lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Browse Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/sellers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-950 font-poppins">
                  <Users className="w-5 h-5 mr-2" />
                  Find Suppliers
                </Button>
              </Link>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-pakistani_green-600 dark:text-pakistani_green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-poppins">Verified Suppliers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2 rounded-full">
                  <ShoppingBag className="w-5 h-5 text-pakistani_green-600 dark:text-pakistani_green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-poppins">Quality Products</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-pakistani_green-400 to-pakistani_green-600 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2 rounded-full">
                    <Users className="w-6 h-6 text-pakistani_green-600 dark:text-pakistani_green-400" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white font-poppins">Connect with Suppliers</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-pakistani_green-500 rounded-full w-4/5"></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-poppins">Join thousands of successful businesses</div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-pakistani_green-100 dark:bg-pakistani_green-900/50 rounded-full p-4 shadow-lg">
              <ShoppingBag className="w-8 h-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
