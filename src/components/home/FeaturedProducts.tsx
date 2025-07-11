
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, MapPin, Package, Heart } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import SkeletonImage from '@/components/ui/skeleton-image';
import LazyLoadWrapper from '@/components/ui/lazy-load-wrapper';

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Rice - 25KG",
      price: "PKR 3,500",
      originalPrice: "PKR 4,000",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop",
      webpImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop&fm=webp",
      supplier: "Al-Barakah Trading",
      location: "Karachi, Sindh",
      rating: 4.8,
      reviews: 120,
      badge: "Best Seller",
      moq: "100 bags",
      discount: 12
    },
    {
      id: 2,
      name: "Organic Cotton Fabric",
      price: "PKR 850",
      originalPrice: "PKR 1,000",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      webpImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&fm=webp",
      supplier: "Textile Solutions",
      location: "Faisalabad, Punjab",
      rating: 4.9,
      reviews: 85,
      badge: "Premium",
      moq: "200 meters",
      discount: 15
    },
    {
      id: 3,
      name: "Industrial LED Lights",
      price: "PKR 1,200",
      originalPrice: "PKR 1,500",
      image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=600&fit=crop",
      webpImage: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=600&fit=crop&fm=webp",
      supplier: "ElectroMax",
      location: "Lahore, Punjab",
      rating: 4.7,
      reviews: 95,
      badge: "Energy Saver",
      moq: "50 units",
      discount: 20
    },
    {
      id: 4,
      name: "Surgical Instruments Set",
      price: "PKR 25,000",
      originalPrice: "PKR 30,000",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
      webpImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&fm=webp",
      supplier: "MediCorp International",
      location: "Sialkot, Punjab",
      rating: 4.9,
      reviews: 150,
      badge: "Certified",
      moq: "10 sets",
      discount: 17
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-500 bg-clip-text text-transparent font-poppins">
              Featured Products
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins leading-relaxed">
              Discover top-quality products from verified suppliers across Pakistan. 
              Get the best deals with competitive pricing and reliable service.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link to="/products">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-950 group"
              >
                View All Products
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Products Grid */}
        <LazyLoadWrapper 
          height="500px" 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {featuredProducts.map((product, index) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <Card 
                variant="interactive"
                className="h-full overflow-hidden group-hover:shadow-2xl group-hover:shadow-pakistani_green-600/20 transition-all duration-500"
              >
                {/* Product Image with Enhanced Styling */}
                <div className="relative overflow-hidden rounded-t-xl">
                  <OptimizedImage
                    src={product.image}
                    webpSrc={product.webpImage}
                    alt={product.name}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    quality="medium"
                    containerClassName="h-48 sm:h-56"
                    loading={index > 3 ? "lazy" : "eager"}
                  />
                  
                  {/* Enhanced Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge 
                      variant="default"
                      className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins font-medium shadow-lg"
                    >
                      {product.badge}
                    </Badge>
                    {product.discount && (
                      <Badge 
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 font-poppins font-medium shadow-lg"
                      >
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-gray-800">
                    <Heart className="w-4 h-4 text-pakistani_green-600 hover:fill-current transition-colors" />
                  </button>
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-white text-pakistani_green-700 hover:bg-gray-50 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      Quick View
                    </Button>
                  </div>
                </div>

                {/* Enhanced Product Details */}
                <div className="p-4 lg:p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg xl:text-xl text-foreground group-hover:text-pakistani_green-600 transition-colors font-poppins line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    
                    {/* Enhanced Price Display */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xl lg:text-2xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through font-poppins">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="space-y-2 pb-2 border-b border-border/50">
                    <p className="text-sm font-medium text-foreground font-poppins">
                      {product.supplier}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1 text-pakistani_green-500" />
                      <span className="font-poppins">{product.location}</span>
                    </div>
                  </div>

                  {/* Rating & MOQ */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground font-poppins">
                        {product.rating}
                      </span>
                      <span className="text-xs text-muted-foreground font-poppins">
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Package className="w-3 h-3 mr-1" />
                      <span className="font-poppins">MOQ: {product.moq}</span>
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <Button 
                    variant="gradient"
                    className="w-full mt-4 shadow-lg hover:shadow-pakistani_green-600/30 group/btn"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </LazyLoadWrapper>

        {/* Enhanced Call to Action */}
        <div className="text-center mt-16 lg:mt-20 space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground font-poppins">
              Ready to Start Your Business Journey?
            </h3>
            <p className="text-muted-foreground font-poppins max-w-2xl mx-auto">
              Join thousands of successful businesses on Pakistan's most trusted B2B marketplace
            </p>
          </div>
          
          <Link to="/signup">
            <Button 
              variant="gradient"
              size="xl" 
              className="shadow-2xl hover:shadow-pakistani_green-600/30 group"
            >
              Start Selling Today
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
