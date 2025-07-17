import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Store, Search, MapPin, Phone, Package, Star, Users, Clock } from 'lucide-react';
import { Shop } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const fetchShops = async () => {
    try {
      setLoading(true);
      console.log('Fetching shops for browse...');
      const {
        data,
        error
      } = await supabase.from('shops').select(`
          *,
          cities!shops_city_id_fkey (
            id,
            name,
            province
          )
        `).order('created_at', {
        ascending: false
      });
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
  const filteredShops = shops.filter(shop => shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || shop.address.toLowerCase().includes(searchTerm.toLowerCase()) || shop.contact.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleViewShop = (shopId: string) => {
    console.log('Navigating to shop:', shopId);
    navigate(`/seller/shop/${shopId}`);
  };
  const getShopImageSrc = (logo?: string) => {
    if (logo && !logo.includes('placeholder.svg')) {
      return logo;
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
  };
  if (loading) {
    return <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>)}
          </div>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Browse Wholesale Shops</h1>
          <p className="text-gray-600 font-poppins mt-1">Discover verified wholesale suppliers across Pakistan</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Store className="h-3 w-3 mr-1" />
          {filteredShops.length} shops
        </Badge>
      </div>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search shops by name, location, or contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-gray-50 border-gray-200 focus:border-pakistani_green-500 font-poppins" />
          </div>
        </CardContent>
      </Card>

      {filteredShops.length === 0 ? <Card className="p-8 text-center bg-gray-50">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No shops found</h3>
          <p className="text-gray-600 font-poppins">
            {searchTerm ? 'No shops match your search.' : 'There are no shops available at the moment.'}
          </p>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200 hover:border-pakistani_green-300" onClick={() => handleViewShop(shop.id)}>
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img src={getShopImageSrc(shop.logo)} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&auto=format`;
          }} />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-gray-800 shadow-sm">
                    <Store className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-pakistani_green-600 text-white shadow-sm">
                    <Star className="h-3 w-3 mr-1" />
                    4.8
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 font-poppins group-hover:text-pakistani_green-600 transition-colors">
                  {shop.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-pakistani_green-600" />
                  <span className="font-poppins">{shop.contact}</span>
                </div>

                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-pakistani_green-600" />
                  <div className="font-poppins">
                    <div className="line-clamp-2">{shop.address}</div>
                    {shop.cities && <div className="text-xs text-pakistani_green-600 font-medium mt-1">
                        {shop.cities.name}, {shop.cities.province}
                      </div>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Package className="h-3 w-3 mr-1" />
                    <span>Products</span>
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

                

                <Button className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins mt-4" onClick={e => {
            e.stopPropagation();
            handleViewShop(shop.id);
          }}>
                  <Package className="h-4 w-4 mr-2" />
                  View Shop & Products
                </Button>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
};
export default BrowseShops;