
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import SkeletonCard from '@/components/ui/skeleton-card';
import { Shop } from '@/lib/types';
import { Store, Package, Search, MapPin, Phone } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchShops = async () => {
    try {
      setLoading(true);
      console.log('Fetching shops...');
      
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }

      console.log('Fetched shops:', data);
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
  }, []);

  // Memoize filtered shops for better performance
  const filteredShops = useMemo(() => {
    if (!debouncedSearchTerm) return shops;
    
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      shop.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      shop.contact.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [shops, debouncedSearchTerm]);

  const handleViewProducts = (shopId: string) => {
    navigate(`/dashboard/browse-shops/${shopId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.classList.remove('hidden');
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const getShopImageSrc = (logo?: string) => {
    if (logo && !logo.includes('placeholder.svg')) {
      return logo;
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&auto=format`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 font-poppins">Browse Wholesale Shops</h1>
          <p className="text-muted-foreground font-poppins">Discover verified wholesale suppliers across Pakistan</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shops by name, location, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-pakistani_green-200 focus:border-pakistani_green-500 font-poppins"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <LoadingSpinner size="lg" text="Loading shops..." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : filteredShops.length === 0 ? (
          <Card className="p-8 text-center bg-card border-border">
            <div className="flex justify-center mb-4">
              <Store className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No shops found</h3>
            <p className="text-muted-foreground font-poppins">
              {searchTerm ? 'No shops match your search. Try different keywords.' : 'There are no shops available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="overflow-hidden bg-white dark:bg-gray-800 border-pakistani_green-200 hover:border-pakistani_green-400 hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-pakistani_green-400 to-pakistani_green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white shadow-md">
                          <img 
                            src={getShopImageSrc(shop.logo)} 
                            alt={shop.name} 
                            className="h-full w-full object-cover opacity-0 transition-opacity duration-300"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                          />
                          <div className={`absolute inset-0 flex items-center justify-center ${shop.logo ? 'hidden' : ''}`}>
                            <Store className="h-6 w-6 text-pakistani_green-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="font-semibold text-lg text-white font-poppins group-hover:text-pakistani_green-100 transition-colors line-clamp-1">
                            {shop.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-pakistani_green-600" />
                        <span className="font-poppins truncate">{shop.contact}</span>
                      </div>
                      <div className="flex items-start text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-pakistani_green-600" />
                        <div className="font-poppins flex-1">
                          <div className="line-clamp-2">{shop.address}</div>
                          <div className="text-xs mt-1 text-pakistani_green-600 font-medium">
                            Postal: {shop.postal_code}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleViewProducts(shop.id)}
                      className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins group-hover:shadow-lg transition-all duration-200"
                    >
                      <Package className="h-4 w-4 mr-2" /> 
                      Browse Products
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const BrowseShopsWithAuth = () => (
  <ProtectedRoute allowedRoles={['seller']}>
    <BrowseShops />
  </ProtectedRoute>
);

export default BrowseShopsWithAuth;
