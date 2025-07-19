
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Search, Package, Store, Filter, Grid, List } from 'lucide-react';

const Favorites: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const handleBrowseProducts = () => {
    navigate('/products');
  };

  const handleBrowseShops = () => {
    navigate('/dashboard/browse-shops');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Favorites</h1>
              <p className="text-muted-foreground font-poppins">
                Your saved products and shops
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Favorites</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="shops">Shops</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-poppins">No favorites yet</h3>
                      <p className="text-muted-foreground font-poppins">
                        Start browsing products and shops to add them to your favorites
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button 
                        className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                        onClick={handleBrowseProducts}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Browse Products
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleBrowseShops}
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Browse Shops
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <Package className="w-5 h-5" />
                    Favorite Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-poppins">
                      No favorite products yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shops">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <Store className="w-5 h-5" />
                    Favorite Shops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-poppins">
                      No favorite shops yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Favorites;
