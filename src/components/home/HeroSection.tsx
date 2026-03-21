import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Users, ShieldCheck, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [products, shops, cities] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('cities').select('id', { count: 'exact', head: true }),
      ]);
      return {
        products: products.count || 0,
        shops: shops.count || 0,
        cities: cities.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-10 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 sm:w-72 h-40 sm:h-72 bg-primary-foreground/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-52 sm:w-96 h-52 sm:h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-foreground/5 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-5 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-foreground/20 rounded-full">
                <span className="text-xs sm:text-sm font-medium font-poppins">
                  🎉 Join Now! Free Ads for First 10 Wholesalers!
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-poppins">
                Pakistan's Premier
                <span className="block text-yellow-300">B2B Marketplace</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-lg font-poppins">
                Connect wholesalers and retailers across Pakistan. Find verified suppliers, 
                negotiate better prices, and grow your business with confidence.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products, shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 bg-background text-foreground border-0 font-poppins rounded-xl shadow-lg text-sm sm:text-base"
                />
              </div>
              <Button type="submit" size="lg" className="bg-yellow-400 text-primary hover:bg-yellow-300 font-poppins h-10 sm:h-12 px-4 sm:px-6 rounded-xl shadow-lg text-sm sm:text-base">
                Search
              </Button>
            </form>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-poppins min-h-[44px] sm:min-h-[48px] text-sm sm:text-base" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
                {user ? 'Dashboard' : 'Signup'}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={() => navigate(user ? '/products' : '/login')} className="border-primary-foreground hover:bg-primary-foreground/10 text-primary-foreground font-poppins font-medium min-h-[44px] sm:min-h-[48px] text-sm sm:text-base">
                {user ? 'Browse Products' : 'Login'}
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-primary-foreground/20">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold font-poppins">{stats ? stats.products.toLocaleString() + '+' : '...'}</div>
                <div className="text-xs sm:text-sm text-primary-foreground/70 font-poppins">Products</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold font-poppins">{stats ? stats.shops.toLocaleString() + '+' : '...'}</div>
                <div className="text-xs sm:text-sm text-primary-foreground/70 font-poppins">Verified Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold font-poppins">{stats ? stats.cities.toLocaleString() + '+' : '...'}</div>
                <div className="text-xs sm:text-sm text-primary-foreground/70 font-poppins">Cities</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Features (hidden on small mobile, shown on sm+) */}
          <div className="hidden sm:block space-y-4 md:space-y-6">
            <div className="group bg-primary-foreground/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-7 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-foreground/10">
              <div className="flex items-start space-x-4 md:space-x-5">
                <div className="p-3 md:p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="space-y-1 md:space-y-2 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold font-poppins">Verified Network</h3>
                  <p className="text-sm md:text-base text-primary-foreground/70 font-poppins leading-relaxed">
                    Connect with verified wholesalers and retailers across Pakistan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-primary-foreground/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-7 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-foreground/10">
              <div className="flex items-start space-x-4 md:space-x-5">
                <div className="p-3 md:p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="space-y-1 md:space-y-2 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold font-poppins">Secure Transactions</h3>
                  <p className="text-sm md:text-base text-primary-foreground/70 font-poppins leading-relaxed">
                    Safe and secure payment processing with buyer protection
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-primary-foreground/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-7 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-foreground/10">
              <div className="flex items-start space-x-4 md:space-x-5">
                <div className="p-3 md:p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="space-y-1 md:space-y-2 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold font-poppins">Business Growth</h3>
                  <p className="text-sm md:text-base text-primary-foreground/70 font-poppins leading-relaxed">
                    Expand your reach and grow your business with our platform
                  </p>
                </div>
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
