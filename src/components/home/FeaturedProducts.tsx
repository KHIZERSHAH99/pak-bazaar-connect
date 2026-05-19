
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Package } from 'lucide-react';
import OptimizedImage from '@/components/ui/image-optimizer';
import LazyLoadWrapper from '@/components/ui/lazy-load-wrapper';
import { getActiveProducts } from '@/lib/products';
import { Product } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

const FeaturedProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const activeProducts = await getActiveProducts(4);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4 font-poppins">
            {t('featuredProducts.title')}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-8 font-poppins px-2">
            {t('featuredProducts.description')}
          </p>
          <Link to="/products">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 font-poppins">
              {t('featuredProducts.viewAll')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-32 sm:h-48 bg-muted animate-pulse"></div>
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <LazyLoadWrapper height="400px" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-primary/20 hover:scale-[1.02] hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={product.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"}
                      alt={product.name}
                      className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      quality="medium"
                      containerClassName="h-32 sm:h-48"
                    />
                    <Badge className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-primary hover:bg-primary/90 text-primary-foreground font-poppins text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                      {product.categories?.name || "Featured"}
                    </Badge>
                    <div className="hidden sm:block absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
                    <h3 className="font-semibold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors font-poppins line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-base sm:text-xl font-bold text-primary font-poppins">
                        PKR {product.price?.toLocaleString()}
                      </span>
                      {product.sample_price && (
                        <span className="hidden sm:inline text-sm text-muted-foreground font-poppins">
                          {t('featuredProducts.sample')}: PKR {product.sample_price}
                        </span>
                      )}
                    </div>

                    {/* Supplier Info */}
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground font-poppins truncate">
                        {product.shops?.name || "Verified Supplier"}
                      </p>
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="font-poppins">
                          {product.shops?.cities?.name ? `${product.shops.cities.name}, ${product.shops.cities.province}` : "Pakistan"}
                        </span>
                      </div>
                    </div>

                    {/* MOQ */}
                    <div className="hidden sm:flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-poppins">
                        {t('featuredProducts.moq')}: {product.moq || 1}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins mt-2 sm:mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0 rounded-lg sm:rounded-xl shadow-lg hover:shadow-primary/30 h-9 sm:min-h-[44px] text-xs sm:text-sm">
                      <span className="hidden sm:inline">{t('featuredProducts.viewDetails')}</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </LazyLoadWrapper>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-poppins">{t('featuredProducts.noProducts')}</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins shadow-lg">
              {t('featuredProducts.startJourney')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
