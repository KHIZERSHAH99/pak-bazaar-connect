
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, MapPin, Package } from 'lucide-react';
import OptimizedImage from '@/components/ui/image-optimizer';
import LazyLoadWrapper from '@/components/ui/lazy-load-wrapper';

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Rice - 25KG",
      price: "PKR 3,500",
      originalPrice: "PKR 4,000",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
      supplier: "Al-Barakah Trading",
      location: "Karachi, Sindh",
      rating: 4.8,
      reviews: 120,
      badge: "Best Seller",
      moq: "100 bags"
    },
    {
      id: 2,
      name: "Organic Cotton Fabric",
      price: "PKR 850",
      originalPrice: "PKR 1,000",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      supplier: "Textile Solutions",
      location: "Faisalabad, Punjab",
      rating: 4.9,
      reviews: 85,
      badge: "Premium",
      moq: "200 meters"
    },
    {
      id: 3,
      name: "Industrial LED Lights",
      price: "PKR 1,200",
      originalPrice: "PKR 1,500",
      image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop",
      supplier: "ElectroMax",
      location: "Lahore, Punjab",
      rating: 4.7,
      reviews: 95,
      badge: "Energy Saver",
      moq: "50 units"
    },
    {
      id: 4,
      name: "Surgical Instruments Set",
      price: "PKR 25,000",
      originalPrice: "PKR 30,000",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      supplier: "MediCorp International",
      location: "Sialkot, Punjab",
      rating: 4.9,
      reviews: 150,
      badge: "Certified",
      moq: "10 sets"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-poppins">
            Discover top-quality products from verified suppliers across Pakistan
          </p>
          <Link to="/products">
            <Button variant="outline" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-950 font-poppins">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <LazyLoadWrapper height="400px" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:shadow-pakistani_green-200/50 dark:hover:shadow-pakistani_green-900/50">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    quality="medium"
                    containerClassName="h-48"
                  />
                  <Badge className="absolute top-3 left-3 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
                    {product.badge}
                  </Badge>
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
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
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through font-poppins">
                      {product.originalPrice}
                    </span>
                  </div>

                  {/* Supplier Info */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                      {product.supplier}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="font-poppins">{product.location}</span>
                    </div>
                  </div>

                  {/* Rating & MOQ */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                        {product.rating}
                      </span>
                      <span className="text-xs text-gray-500 font-poppins">
                        ({product.reviews})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-poppins">
                      MOQ: {product.moq}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </LazyLoadWrapper>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link to="/signup">
            <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins shadow-lg">
              Start Your Business Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
