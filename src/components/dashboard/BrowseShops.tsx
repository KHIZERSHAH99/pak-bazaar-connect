import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Search, MapPin, Phone, Package, Users, Clock, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface PublicShop {
  id: string;
  name: string;
  logo: string | null;
  city_id: string | null;
  created_at: string;
  // Full details only available for authenticated users
  contact?: string;
  address?: string;
  postal_code?: string;
}

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<PublicShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch cities for filter
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-list'],
    queryFn: async () => {
      const { data } = await supabase.from('cities').select('id, name').order('name');
      return data || [];
    },
  });

  const fetchShops = async () => {
    try {
      setLoading(true);
      
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      console.log('Fetching shops, authenticated:', authenticated);
      
      let data, error;
      
      if (authenticated) {
        // Authenticated users get full shop details
        const result = await supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      } else {
        // Non-authenticated users get public view (name, logo, city only)
        const result = await supabase
          .from('shops_public')
          .select('*')
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }
      
      console.log('Fetched shops:', data?.length);
      setShops(data || []);
    } catch (error: any) {
      console.error('Failed to fetch shops:', error);
      toast({
        title: "Error loading shops",
        description: error.message || "Failed to load shops. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchShops();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const filteredShops = shops.filter(shop => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = shop.name.toLowerCase().includes(searchLower);
    const addressMatch = shop.address?.toLowerCase().includes(searchLower) || false;
    const contactMatch = shop.contact?.toLowerCase().includes(searchLower) || false;
    const cityMatch = selectedCity === 'all' || shop.city_id === selectedCity;
    return (nameMatch || addressMatch || contactMatch) && cityMatch;
  });

  const handleViewShop = (shopId: string) => {
    console.log('Navigating to shop:', shopId);
    navigate(`/shop/${shopId}`);
  };

  const getShopImageSrc = (logo?: string | null) => {
    if (logo && !logo.includes('placeholder.svg')) {
      return logo;
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-start sm:items-center gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground font-poppins">Browse Wholesale Shops</h1>
          <p className="text-xs sm:text-base text-muted-foreground font-poppins mt-0.5 sm:mt-1">Discover verified wholesale suppliers across Pakistan</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0 text-[10px] sm:text-xs">
          <Store className="h-3 w-3 mr-1" />
          {filteredShops.length}<span className="hidden sm:inline">&nbsp;shops</span>
        </Badge>
      </div>

      <Card className="bg-card shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search shops by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-primary font-poppins"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full sm:w-[200px] font-poppins">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredShops.length === 0 ? (
        <Card className="p-12 text-center bg-muted/30 border-dashed">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No shops found</h3>
          <p className="text-muted-foreground font-poppins mb-4">
            {searchTerm
              ? `No shops match "${searchTerm}". Try a different search term.`
              : selectedCity !== 'all'
                ? 'No shops in this city yet. Try selecting "All Cities".'
                : 'There are no shops available at the moment. Check back soon!'}
          </p>
          {(searchTerm || selectedCity !== 'all') && (
            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCity('all'); }} className="font-poppins">
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredShops.map(shop => (
            <Card
              key={shop.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-border hover:border-primary/50"
              onClick={() => handleViewShop(shop.id)}
            >
              <div className="relative h-28 sm:h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                <img
                  src={getShopImageSrc(shop.logo)}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
                  }}
                />
                <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                  <Badge className="bg-background/90 text-foreground shadow-sm text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                    <Store className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2 px-3 pt-3 sm:pb-3 sm:px-6 sm:pt-6">
                <CardTitle className="text-sm sm:text-lg font-semibold text-foreground font-poppins group-hover:text-primary transition-colors line-clamp-1">
                  {shop.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 sm:space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
                {isAuthenticated && shop.contact ? (
                  <>
                    <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-poppins">{shop.contact}</span>
                    </div>

                    <div className="hidden sm:flex items-start text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                      <div className="font-poppins">
                        <div className="line-clamp-2">{shop.address}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="hidden sm:flex items-center text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                    <Lock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-poppins text-xs">Login to see contact details</span>
                  </div>
                )}

                <div className="hidden sm:flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    <span>Products</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    <span>200+ Orders</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Active</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins mt-2 sm:mt-4 h-9 sm:h-10 text-xs sm:text-sm tap-compact"
                  onClick={e => {
                    e.stopPropagation();
                    handleViewShop(shop.id);
                  }}
                >
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="sm:hidden">View Shop</span>
                  <span className="hidden sm:inline">View Shop & Products</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseShops;