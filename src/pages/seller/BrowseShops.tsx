
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import SkeletonCard from '@/components/ui/skeleton-card';
import { getAllShops, Shop } from '@/lib/supabase';
import { Store, Package, Search, MapPin, Phone } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await getAllShops();
      setShops(data);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 font-poppins">Browse Wholesale Shops</h1>
          <p className="text-muted-foreground font-poppins">Discover verified wholesale suppliers across Pakistan</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shops by name, location, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border font-poppins"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-200 group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 bg-muted">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name} 
                          className="h-full w-full object-cover opacity-0 transition-opacity duration-300"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center ${shop.logo ? 'hidden' : ''}`}>
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground font-poppins group-hover:text-primary transition-colors">
                        {shop.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-poppins truncate">{shop.contact}</span>
                    </div>
                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="font-poppins">
                        <div>{shop.address}</div>
                        <div className="text-xs mt-1">Postal: {shop.postal_code}</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleViewProducts(shop.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins group-hover:scale-105 transition-transform"
                  >
                    <Package className="h-4 w-4 mr-2" /> 
                    Browse Products
                  </Button>
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
