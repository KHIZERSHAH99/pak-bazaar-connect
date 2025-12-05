import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Store, Search, MapPin, Phone, Package, Star, Users, Clock, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    return nameMatch || addressMatch || contactMatch;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Browse Wholesale Shops</h1>
          <p className="text-muted-foreground font-poppins mt-1">Discover verified wholesale suppliers across Pakistan</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Store className="h-3 w-3 mr-1" />
          {filteredShops.length} shops
        </Badge>
      </div>

      <Card className="bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search shops by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:border-primary font-poppins"
            />
          </div>
        </CardContent>
      </Card>

      {filteredShops.length === 0 ? (
        <Card className="p-8 text-center bg-muted/30">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No shops found</h3>
          <p className="text-muted-foreground font-poppins">
            {searchTerm ? 'No shops match your search.' : 'There are no shops available at the moment.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => (
            <Card
              key={shop.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-border hover:border-primary/50"
              onClick={() => handleViewShop(shop.id)}
            >
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                <img
                  src={getShopImageSrc(shop.logo)}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-background/90 text-foreground shadow-sm">
                    <Store className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground shadow-sm">
                    <Star className="h-3 w-3 mr-1" />
                    4.8
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground font-poppins group-hover:text-primary transition-colors">
                  {shop.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {isAuthenticated && shop.contact ? (
                  <>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-poppins">{shop.contact}</span>
                    </div>

                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                      <div className="font-poppins">
                        <div className="line-clamp-2">{shop.address}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                    <Lock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-poppins text-xs">Login to see contact details</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins mt-4"
                  onClick={e => {
                    e.stopPropagation();
                    handleViewShop(shop.id);
                  }}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Shop & Products
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