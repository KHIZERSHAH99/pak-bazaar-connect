import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Package, Store, ExternalLink } from 'lucide-react';
import { getFavoriteProducts, getFavoriteShops } from '@/lib/favorites';
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

interface Shop {
  id: string;
  name: string;
  address: string;
  logo?: string;
}

const FavoritesDisplay: React.FC = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Load favorite products
      const productFavorites = await getFavoriteProducts();
      
      if (productFavorites.length > 0) {
        const productIds = productFavorites.map(fav => fav.product_id);
        
        const { data: products, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image,
            shop_id,
            shops!fk_products_shop_id(name)
          `)
          .in('id', productIds)
          .eq('is_active', true);

        if (!productError && products) {
          setFavoriteProducts(products);
        }
      }

      // Load favorite shops
      const shopFavorites = await getFavoriteShops();
      
      if (shopFavorites.length > 0) {
        const shopIds = shopFavorites.map(fav => fav.shop_id);
        
        const { data: shops, error: shopError } = await supabase
          .from('shops')
          .select('id, name, address, logo')
          .in('id', shopIds);

        if (!shopError && shops) {
          setFavoriteShops(shops);
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

  const hasAnyFavorites = favoriteProducts.length > 0 || favoriteShops.length > 0;

  if (!hasAnyFavorites) {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-poppins">
          No favorites yet
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Start exploring products and shops to add them to your favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Favorite Products */}
      {favoriteProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground font-poppins flex items-center gap-2">
            <Package className="w-5 h-5" />
            Favorite Products ({favoriteProducts.length})
          </h3>
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
                      <h3 className="font-semibold font-poppins text-foreground">{product.name}</h3>
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
        </div>
      )}

      {/* Favorite Shops */}
      {favoriteShops.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground font-poppins flex items-center gap-2">
            <Store className="w-5 h-5" />
            Favorite Shops ({favoriteShops.length})
          </h3>
          <div className="grid gap-4">
            {favoriteShops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold font-poppins text-foreground">{shop.name}</h3>
                      <p className="text-sm text-muted-foreground">{shop.address}</p>
                    </div>
                    
                    <Link to={`/seller/shop/${shop.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Shop
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesDisplay;