import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextFixed';
import { useNavigate } from 'react-router-dom';
const HeroSection: React.FC = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  return <div className="relative bg-gradient-to-br from-pakistani_green-600 via-pakistani_green-700 to-pakistani_green-800 text-white py-24 overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent mx-[77px]"></div>
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
              <Button size="lg" className="bg-yellow-400 text-primary hover:bg-yellow-300 font-poppins" onClick={() => navigate('/browse-shops')}>
                Browse Shops & Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={() => navigate(user && user ? '/dashboard' : '/signup')} className="border-white hover:bg-white font-poppins font-medium text-green-950">
                {user ? 'Dashboard' : 'Become Wholesaler'}
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
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-shadow duration-300">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">Verified Network</h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Connect with verified wholesalers and retailers across Pakistan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-shadow duration-300">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">Secure Transactions</h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Safe and secure payment processing with buyer protection
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-yellow-400/30 transition-shadow duration-300">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold font-poppins group-hover:text-yellow-100 transition-colors">Business Growth</h3>
                  <p className="text-green-100/90 font-poppins leading-relaxed">
                    Expand your reach and grow your business with our platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;