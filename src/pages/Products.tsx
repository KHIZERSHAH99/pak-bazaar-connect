
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, MapPin, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  moq?: number;
  shops: {
    id: string;
    name: string;
    contact: string;
    address: string;
    cities?: {
      name: string;
      province: string;
    };
  };
  categories?: {
    id: string;
    name: string;
  };
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops!inner (
            id,
            name,
            contact,
            address,
            cities (
              name,
              province
            )
          ),
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.shops.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">Browse Products</h1>
          <p className="text-muted-foreground font-poppins">
            Discover quality products from verified Pakistani suppliers
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground font-poppins">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No products found</h3>
            <p className="text-muted-foreground font-poppins">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No products are available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="space-y-2 mb-3">
                    <h3 className="font-bold text-lg text-foreground font-poppins line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground font-poppins line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary font-poppins">
                        PKR {product.price.toLocaleString()}
                      </span>
                      {product.moq && product.moq > 1 && (
                        <Badge variant="outline">MOQ: {product.moq}</Badge>
                      )}
                    </div>
                    
                    {product.categories && (
                      <Badge className="bg-primary/10 text-primary">
                        {product.categories.name}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
