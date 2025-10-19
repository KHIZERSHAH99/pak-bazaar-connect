
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, MapPin, Package } from 'lucide-react';
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
        const activeProducts = await getActiveProducts(4); // Get 4 featured products
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
    <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 font-poppins">
            {t('featuredProducts')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 font-poppins px-2">
            {t('discoverTopQuality')}
          </p>
          <Link to="/products">
            <Button variant="outline" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-950 font-poppins">
              {t('viewAllProducts')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <LazyLoadWrapper height="400px" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-pakistani_green-300/30 dark:bg-gray-800/80 dark:hover:shadow-pakistani_green-700/40 hover:scale-[1.02] hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={product.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      quality="medium"
                      containerClassName="h-48"
                    />
                    <Badge className="absolute top-3 left-3 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
                      {product.categories?.name || t('featured')}
                    </Badge>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <Package className="w-4 h-4 text-pakistani_green-600" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-pakistani_green-600 transition-colors font-poppins line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">
                        PKR {product.price}
                      </span>
                      {product.sample_price && (
                        <span className="text-sm text-gray-500 font-poppins">
                          {t('sample')}: PKR {product.sample_price}
                        </span>
                      )}
                    </div>

                    {/* Supplier Info */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                        {product.shops?.name || t('verifiedSupplier')}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="font-poppins">
                          {product.shops?.cities?.name ? `${product.shops.cities.name}, ${product.shops.cities.province}` : t('pakistan')}
                        </span>
                      </div>
                    </div>

                    {/* MOQ */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                          4.8
                        </span>
                        <span className="text-xs text-gray-500 font-poppins">
                          ({t('reviews')})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-poppins">
                        MOQ: {product.moq || 1}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white font-poppins mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 rounded-xl shadow-lg hover:shadow-pakistani_green-600/30">
                      {t('viewDetails')}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </LazyLoadWrapper>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-poppins">{t('noFeaturedProducts')}</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link to="/signup">
            <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins shadow-lg">
              {t('startBusinessJourney')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
