
import React from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { ArrowRight, Users, ShieldCheck, TrendingUp } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-pakistani_green-600 via-pakistani_green-700 to-pakistani_green-800 text-white py-20 lg:py-32 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                <span className="text-sm font-medium font-poppins animate-bounce">
                  🎉 Join Now! Free Ads for First 10 Wholesalers!
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight font-poppins">
                Pakistan's Premier
                <span className="block bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                  B2B Marketplace
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-green-100/90 max-w-2xl font-poppins leading-relaxed">
                Connect wholesalers and retailers across Pakistan. Find verified suppliers, 
                negotiate better prices, and grow your business with confidence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="gradient"
                size="xl" 
                className="bg-white text-pakistani_green-700 hover:bg-gray-50 shadow-2xl hover:shadow-white/20"
                onClick={() => window.location.href = '/signup'}
              >
                Start Selling Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                size="xl"
                className="border-2 border-white text-white hover:bg-white hover:text-pakistani_green-700 backdrop-blur-sm"
                onClick={() => window.location.href = '/products'}
              >
                Browse Products
              </Button>
            </div>
            
            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-2xl md:text-3xl font-bold font-poppins mb-1">1000+</div>
                <div className="text-sm md:text-base text-green-100/80 font-poppins">Products</div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-2xl md:text-3xl font-bold font-poppins mb-1">50+</div>
                <div className="text-sm md:text-base text-green-100/80 font-poppins">Verified Suppliers</div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-2xl md:text-3xl font-bold font-poppins mb-1">15+</div>
                <div className="text-sm md:text-base text-green-100/80 font-poppins">Cities</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Enhanced Features */}
          <div className="space-y-6">
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-all duration-300 group-hover:rotate-3">
                  <Users className="h-7 w-7 text-pakistani_green-800" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">
                    Verified Network
                  </h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Connect with verified wholesalers and retailers across Pakistan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-all duration-300 group-hover:rotate-3">
                  <ShieldCheck className="h-7 w-7 text-pakistani_green-800" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">
                    Secure Transactions
                  </h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Safe and secure payment processing with buyer protection
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-all duration-300 group-hover:rotate-3">
                  <TrendingUp className="h-7 w-7 text-pakistani_green-800" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">
                    Business Growth
                  </h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Expand your reach and grow your business with our platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
