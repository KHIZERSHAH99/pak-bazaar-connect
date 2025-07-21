
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Shop } from '@/lib/types';
import { Store, Package, Search, MapPin, Phone, Star, Users, Clock } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
        .select(`
          *,
          cities!shops_city_id_fkey (
            id,
            name,
            province
          )
        `)
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

  const getShopImageSrc = (logo?: string) => {
    if (logo && !logo.includes('placeholder.svg')) {
      return logo;
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">Browse Wholesale Shops</h1>
            <p className="text-gray-600 font-poppins mt-1">Discover verified wholesale suppliers across Pakistan</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Store className="h-3 w-3 mr-1" />
              {filteredShops.length} shops
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search shops by name, location, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-primary font-poppins"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="shrink-0"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shops Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading shops..." />
          </div>
        ) : filteredShops.length === 0 ? (
          <Card className="p-12 text-center bg-gray-50">
            <div className="flex justify-center mb-4">
              <Store className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No shops found</h3>
            <p className="text-gray-500 font-poppins">
              {searchTerm ? 'No shops match your search. Try different keywords.' : 'There are no shops available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card 
                key={shop.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200 hover:border-primary/30"
                onClick={() => handleViewProducts(shop.id)}
              >
                {/* Shop Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src={getShopImageSrc(shop.logo)} 
                    alt={shop.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-gray-800 shadow-sm">
                      <Store className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-white shadow-sm">
                      <Star className="h-3 w-3 mr-1" />
                      4.8
                    </Badge>
                  </div>
                </div>

                {/* Shop Details */}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 font-poppins group-hover:text-primary transition-colors">
                    {shop.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-poppins">{shop.contact}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <div className="font-poppins">
                      <div className="line-clamp-2">{shop.address}</div>
                      {shop.cities && (
                        <div className="text-xs text-primary font-medium mt-1">
                          {shop.cities.name}, {shop.cities.province}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <Package className="h-3 w-3 mr-1" />
                      <span>50+ Products</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      <span>200+ Orders</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Commission Rate */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600 font-poppins">Commission Rate</span>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {shop.commission_rate || 5}%
                    </Badge>
                  </div>

                  {/* Browse Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-poppins mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProducts(shop.id);
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </CardContent>
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
