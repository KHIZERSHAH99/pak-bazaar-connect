import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Package, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoShowcase = () => {
  const demoShops = [
    {
      id: 1,
      name: "Al-Barakah Trading Co.",
      description: "Premium rice and grain wholesaler serving Pakistan since 1985",
      location: "Karachi, Sindh",
      rating: 4.8,
      reviews: 245,
      products: 156,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
      category: "Food & Agriculture",
      verified: true
    },
    {
      id: 2,
      name: "Textile Solutions Hub",
      description: "Organic cotton fabrics and premium textile products",
      location: "Faisalabad, Punjab",
      rating: 4.9,
      reviews: 189,
      products: 203,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      category: "Textiles",
      verified: true
    },
    {
      id: 3,
      name: "ElectroMax Industries",
      description: "Industrial LED lights and electrical equipment supplier",
      location: "Lahore, Punjab",
      rating: 4.7,
      reviews: 134,
      products: 89,
      image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop",
      category: "Electronics",
      verified: true
    }
  ];

  const demoProducts = [
    {
      id: 1,
      name: "Premium Basmati Rice - Super Kernel",
      price: "PKR 3,500",
      originalPrice: "PKR 4,000",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
      supplier: "Al-Barakah Trading Co.",
      rating: 4.8,
      moq: "100 bags",
      category: "Food & Agriculture"
    },
    {
      id: 2,
      name: "Organic Cotton Fabric - Premium Grade",
      price: "PKR 850",
      originalPrice: "PKR 1,000",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      supplier: "Textile Solutions Hub",
      rating: 4.9,
      moq: "200 meters",
      category: "Textiles"
    },
    {
      id: 3,
      name: "Industrial LED Floodlight - 100W",
      price: "PKR 1,200",
      originalPrice: "PKR 1,500",
      image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=200&fit=crop",
      supplier: "ElectroMax Industries",
      rating: 4.7,
      moq: "50 units",
      category: "Electronics"
    },
    {
      id: 4,
      name: "Surgical Steel Instruments Set",
      price: "PKR 25,000",
      originalPrice: "PKR 30,000",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop",
      supplier: "MediCorp International",
      rating: 4.9,
      moq: "10 sets",
      category: "Medical"
    }
  ];

  return (
    <Layout
      title="Demo Showcase - See How Pak Bazaar Connect Works"
      description="Explore our demo shops and products to see how Pakistan's leading B2B marketplace connects wholesalers and retailers."
      keywords="Pakistan B2B demo, wholesale marketplace preview, supplier showcase, sample products"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-yellow-500 text-yellow-900 mb-4 font-poppins">
                DEMO PREVIEW
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
                See How Our Platform Works
              </h1>
              <p className="text-xl text-green-100 font-poppins">
                Explore sample shops and products to understand the value we provide to Pakistani businesses
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Demo Shops Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                Sample Verified Shops
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-poppins">
                See how wholesalers showcase their businesses on our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demoShops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-poppins">
                        {shop.category}
                      </Badge>
                      {shop.verified && (
                        <Badge className="bg-green-100 text-green-800 font-poppins">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold font-poppins">
                      {shop.name}
                    </CardTitle>
                    <CardDescription className="font-poppins">
                      {shop.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-poppins">{shop.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium font-poppins">{shop.rating}</span>
                          <span className="text-xs text-gray-500 ml-1 font-poppins">({shop.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Package className="w-4 h-4 mr-1" />
                          <span className="font-poppins">{shop.products} products</span>
                        </div>
                      </div>
                      <Button className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
                        <Eye className="w-4 h-4 mr-2" />
                        View Shop (Demo)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Demo Products Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                Sample Products
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-poppins">
                Browse demo products to see how suppliers list their inventory
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Button size="sm" variant="ghost" className="bg-white/90 hover:bg-white p-2">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-pakistani_green-600 font-poppins">
                      Demo
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 font-poppins">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-bold text-pakistani_green-600 font-poppins">
                        {product.price}
                      </span>
                      <span className="text-xs text-gray-500 line-through font-poppins">
                        {product.originalPrice}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-poppins">
                      {product.supplier}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-xs font-medium font-poppins">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-poppins">MOQ: {product.moq}</span>
                    </div>
                    <Button size="sm" className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Features Demo */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                Platform Features Preview
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-poppins">
                See what makes our B2B marketplace special
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pakistani_green-100 dark:bg-pakistani_green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-pakistani_green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-poppins">Product Catalog</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-poppins">
                    Professional product listings with detailed specifications, pricing, and supplier information
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pakistani_green-100 dark:bg-pakistani_green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-pakistani_green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-poppins">Verified Suppliers</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-poppins">
                    All suppliers are verified with business registration and quality checks for your security
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pakistani_green-100 dark:bg-pakistani_green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-pakistani_green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-poppins">Easy Ordering</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-poppins">
                    Streamlined ordering process with secure payments and order tracking capabilities
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-pakistani_green-50 to-green-50 dark:from-pakistani_green-950 dark:to-green-950 border-pakistani_green-200 dark:border-pakistani_green-800 p-8">
              <h3 className="text-2xl font-bold text-pakistani_green-900 dark:text-pakistani_green-100 mb-4 font-poppins">
                Ready to Join Pakistan's Leading B2B Marketplace?
              </h3>
              <p className="text-pakistani_green-700 dark:text-pakistani_green-300 mb-6 font-poppins">
                Create your account today and start connecting with verified businesses across Pakistan
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
                    Start Selling
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 font-poppins">
                    Start Buying
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DemoShowcase;