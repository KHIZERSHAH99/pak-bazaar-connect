
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllShops, Shop } from '@/lib/supabase';
import { Store, Package, Search } from 'lucide-react';

const BrowseShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProducts = (shopId: string) => {
    navigate(`/dashboard/browse-shops/${shopId}`);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Browse Wholesale Shops</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search shops by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredShops.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Store className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No shops found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No shops match your search. Try different keywords.' : 'There are no shops available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-pakistani-green-100 rounded-full flex items-center justify-center mr-4">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name} 
                          className="h-full w-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/100?text=Shop";
                          }}
                        />
                      ) : (
                        <Store className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{shop.name}</h3>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-600">
                      <span className="font-medium">Contact:</span> {shop.contact}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Address:</span> {shop.address}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Postal Code:</span> {shop.postal_code}
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleViewProducts(shop.id)}
                    className="w-full bg-primary hover:bg-pakistani-green-800"
                  >
                    <Package className="h-4 w-4 mr-2" /> Browse Products
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
