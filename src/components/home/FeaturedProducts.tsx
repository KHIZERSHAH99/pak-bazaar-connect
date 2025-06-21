
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  shops: {
    name: string;
    cities?: {
      name: string;
      province: string;
    };
  };
  categories?: {
    name: string;
  };
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image,
          shops!inner (
            name,
            cities (
              name,
              province
            )
          ),
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-poppins">Featured Products</h2>
            <p className="text-muted-foreground font-poppins">Discover quality products from trusted suppliers</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-poppins">Featured Products</h2>
          <p className="text-muted-foreground font-poppins">Discover quality products from trusted suppliers</p>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No Products Yet</h3>
            <p className="text-muted-foreground font-poppins mb-6">
              Be the first wholesaler to add products to our marketplace!
            </p>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Join as Wholesaler
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {product.image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors font-poppins line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary font-poppins">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.categories && (
                          <Badge className="bg-primary/10 text-primary">
                            {product.categories.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground font-poppins">
                          {product.shops.name}
                        </p>
                        {product.shops.cities && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="font-poppins">
                              {product.shops.cities.name}, {product.shops.cities.province}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full bg-primary hover:bg-primary/90 font-poppins">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Contact Supplier
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <Button variant="outline" size="lg" className="font-poppins">
                  View All Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
