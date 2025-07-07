
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, ShieldCheck, TrendingUp } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 text-white py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full">
                <span className="text-sm font-medium font-poppins">
                  🎉 Join Now! Free Ads for First 10 Wholesalers!
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-poppins">
                Pakistan's Premier
                <span className="block text-yellow-300">B2B Marketplace</span>
              </h1>
              
              <p className="text-xl text-green-100 max-w-lg font-poppins">
                Connect wholesalers and retailers across Pakistan. Find verified suppliers, 
                negotiate better prices, and grow your business with confidence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-pakistani_green-700 hover:bg-gray-100 font-poppins"
                onClick={() => window.location.href = '/signup'}
              >
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-pakistani_green-700 font-poppins"
                onClick={() => window.location.href = '/products'}
              >
                Browse Products
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-green-500">
              <div className="text-center">
                <div className="text-2xl font-bold font-poppins">1000+</div>
                <div className="text-sm text-green-100 font-poppins">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-poppins">50+</div>
                <div className="text-sm text-green-100 font-poppins">Verified Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-poppins">15+</div>
                <div className="text-sm text-green-100 font-poppins">Cities</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Features */}
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-400 rounded-lg">
                  <Users className="h-6 w-6 text-pakistani_green-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-poppins">Verified Network</h3>
                  <p className="text-green-100 font-poppins">
                    Connect with verified wholesalers and retailers across Pakistan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-400 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-pakistani_green-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-poppins">Secure Transactions</h3>
                  <p className="text-green-100 font-poppins">
                    Safe and secure payment processing with buyer protection
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-400 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pakistani_green-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-poppins">Business Growth</h3>
                  <p className="text-green-100 font-poppins">
                    Expand your reach and grow your business with our platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
