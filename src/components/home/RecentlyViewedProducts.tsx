import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

const MAX_RECENT = 8;
const STORAGE_KEY = 'pak-bazaar-recently-viewed';

// Save a product ID to recently viewed
export const trackRecentlyViewed = (productId: string) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    const updated = [productId, ...stored.filter(id => id !== productId)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
};

const RecentlyViewedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
        if (ids.length === 0) { setLoading(false); return; }

        const { data } = await supabase
          .from('products')
          .select('id, name, price, image, shop_id, is_active')
          .in('id', ids)
          .eq('is_active', true)
          .limit(MAX_RECENT);

        // Sort by the order in localStorage
        const sorted = ids
          .map(id => (data || []).find((p: any) => p.id === id))
          .filter(Boolean) as any[];
        
        setProducts(sorted);
      } catch (e) {
        console.error('Error fetching recently viewed:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground font-poppins">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product: any) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow h-full group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'; }}
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium text-foreground font-poppins line-clamp-1">{product.name}</h3>
                  <p className="text-sm font-bold text-primary font-poppins mt-1">
                    PKR {Number(product.price).toLocaleString()}
                  </p>
                  {product.shops?.name && (
                    <p className="text-xs text-muted-foreground font-poppins mt-0.5 truncate">{product.shops.name}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
