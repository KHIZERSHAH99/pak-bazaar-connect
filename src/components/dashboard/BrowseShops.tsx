
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Search, MapPin, Phone, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Shop {
  id: string;
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  owner_id: string;
  cities?: {
    id: string;
    name: string;
    province: string;
  };
}

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          cities (
            id,
            name,
            province
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProducts = (shopId: string) => {
    navigate(`/dashboard/shop/${shopId}/products`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground font-poppins">Browse Shops</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground font-poppins">Browse Shops</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 font-poppins"
          />
        </div>
      </div>

      {filteredShops.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Store className="w-5 h-5" />
              No Shops Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-poppins">
              {searchTerm ? 'No shops match your search criteria.' : 'No wholesale shops are available at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg font-poppins">{shop.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-poppins">{shop.contact}</span>
                </div>
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                  <div className="font-poppins">
                    <div>{shop.address}</div>
                    {shop.cities && (
                      <div className="text-xs">{shop.cities.name}, {shop.cities.province}</div>
                    )}
                    <div className="text-xs">Postal: {shop.postal_code}</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewProducts(shop.id)}
                  className="w-full bg-primary hover:bg-primary/90 font-poppins"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
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
