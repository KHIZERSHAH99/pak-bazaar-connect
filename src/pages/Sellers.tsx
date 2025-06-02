import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMarketplaceShops, getCities } from '@/lib/marketplace';
import { Shop, City } from '@/lib/types';
import { Store, Search, Filter, MapPin, Phone, Globe } from 'lucide-react';

const Sellers: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopsData, citiesData] = await Promise.all([
        getMarketplaceShops({
          city_id: selectedCity === 'all' ? undefined : selectedCity,
          search: searchTerm || undefined,
        }),
        getCities(),
      ]);
      
      setShops(shopsData);
      setCities(citiesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const handleSearch = () => {
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Browse Suppliers</h1>
          <p className="text-gray-600 font-poppins">Connect with verified wholesale suppliers across Pakistan</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={handleSearch} className="bg-primary hover:bg-pakistani-green-800">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            
            {(searchTerm || selectedCity !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 font-poppins">
            {shops.length} supplier{shops.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {shops.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No suppliers found</h3>
            <p className="text-gray-600 font-poppins">Try adjusting your search criteria.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} to={`/seller/${shop.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="h-32 bg-gradient-to-r from-primary to-pakistani-green-600 relative">
                    {shop.company_profiles?.logo ? (
                      <img 
                        src={shop.company_profiles.logo} 
                        alt={shop.name} 
                        className="absolute bottom-4 left-4 h-16 w-16 rounded-full border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full border-4 border-white bg-white flex items-center justify-center">
                        <Store className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 pt-8">
                    <h3 className="font-bold text-xl mb-2 font-poppins">
                      {shop.company_profiles?.company_name || shop.name}
                    </h3>
                    
                    {shop.company_profiles?.description && (
                      <p className="text-gray-600 mb-4 font-poppins line-clamp-2">
                        {shop.company_profiles.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {shop.cities && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="font-poppins">{shop.cities.name}, {shop.cities.province}</span>
                        </div>
                      )}
                      
                      {shop.company_profiles?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="font-poppins">{shop.company_profiles.phone}</span>
                        </div>
                      )}
                      
                      {shop.company_profiles?.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <span className="font-poppins">Website Available</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button className="w-full bg-primary hover:bg-pakistani-green-800">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sellers;
