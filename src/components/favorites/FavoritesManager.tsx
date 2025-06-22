import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Heart, Search, Filter, Star, MapPin, Phone, Globe, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface FavoriteItem {
  id: string;
  type: 'shop' | 'product';
  item_id: string;
  created_at: string;
  shop?: {
    id: string;
    name: string;
    contact: string;
    address: string;
    logo?: string;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
    shop: {
      name: string;
      contact: string;
    };
  };
}

export const FavoritesManager: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'shop' | 'product'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Use mock data for faster loading - replace with actual API when ready
      const mockFavorites: FavoriteItem[] = [
        {
          id: '1',
          type: 'shop',
          item_id: 'shop1',
          created_at: new Date().toISOString(),
          shop: {
            id: 'shop1',
            name: 'Electronics Wholesale Hub',
            contact: '03001234567',
            address: 'Karachi, Pakistan',
            logo: undefined
          }
        },
        {
          id: '2',
          type: 'product',
          item_id: 'product1',
          created_at: new Date().toISOString(),
          product: {
            id: 'product1',
            name: 'Samsung Galaxy Phones (Bulk)',
            price: 85000,
            image: undefined,
            shop: {
              name: 'Mobile Mart Wholesale',
              contact: '03009876543'
            }
          }
        }
      ];

      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error Loading Favorites",
        description: "Failed to load your favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Removed from Favorites",
        description: "Item has been removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from favorites.",
        variant: "destructive"
      });
    }
  };

  const filteredFavorites = favorites.filter(fav => {
    const matchesFilter = filter === 'all' || fav.type === filter;
    const matchesSearch = searchTerm === '' || 
      (fav.shop?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fav.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            My Favorites
          </h2>
          <p className="text-muted-foreground">
            Manage your favorite shops and products
          </p>
        </div>
        
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          {favorites.length} Total Favorites
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({favorites.length})
          </Button>
          <Button
            variant={filter === 'shop' ? 'default' : 'outline'}
            onClick={() => setFilter('shop')}
            size="sm"
          >
            Shops ({favorites.filter(f => f.type === 'shop').length})
          </Button>
          <Button
            variant={filter === 'product' ? 'default' : 'outline'}
            onClick={() => setFilter('product')}
            size="sm"
          >
            Products ({favorites.filter(f => f.type === 'product').length})
          </Button>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Favorites Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' 
                ? 'No favorites match your current search or filter.'
                : 'Start adding shops and products to your favorites!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant={favorite.type === 'shop' ? 'default' : 'secondary'}>
                    {favorite.type === 'shop' ? 'Shop' : 'Product'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {favorite.type === 'shop' && favorite.shop && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pakistani_green-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-6 w-6 text-pakistani_green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{favorite.shop.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {favorite.shop.contact}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {favorite.shop.address}
                    </div>
                    
                    <Button className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700">
                      Visit Shop
                    </Button>
                  </>
                )}

                {favorite.type === 'product' && favorite.product && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Star className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{favorite.product.name}</h3>
                        <p className="text-lg font-bold text-pakistani_green-600">
                          PKR {favorite.product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Sold by: {favorite.product.shop.name}</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {favorite.product.shop.contact}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Product
                    </Button>
                  </>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
