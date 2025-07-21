import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Package, Store, ExternalLink } from 'lucide-react';
import { getFavoriteProducts } from '@/lib/favorites';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  shop_id: string;
  shops: {
    name: string;
  };
}

const FavoritesDisplay: React.FC = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favorites = await getFavoriteProducts();
      
      if (favorites.length > 0) {
        const productIds = favorites.map(fav => fav.product_id);
        
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image,
            shop_id,
            shops!shop_id(name)
          `)
          .in('id', productIds)
          .eq('is_active', true);

        if (!error && products) {
          setFavoriteProducts(products);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-poppins">
          No favorite products yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {favoriteProducts.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold font-poppins">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  <Store className="w-3 h-3 inline mr-1" />
                  {product.shops.name}
                </p>
                <p className="font-semibold text-primary mt-1">
                  PKR {product.price.toLocaleString()}
                </p>
              </div>
              
              <Link to={`/product/${product.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FavoritesDisplay;