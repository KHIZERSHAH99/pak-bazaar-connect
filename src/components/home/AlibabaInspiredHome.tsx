
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Users,
  Globe,
  TrendingUp,
  Shield,
  Truck,
  Star,
  ArrowRight,
  Package,
  Store,
  Zap
} from 'lucide-react';

const AlibabaInspiredHome = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Electronics', icon: '📱', count: '2.5M+' },
    { name: 'Fashion', icon: '👔', count: '1.8M+' },
    { name: 'Home & Garden', icon: '🏠', count: '950K+' },
    { name: 'Machinery', icon: '⚙️', count: '680K+' },
    { name: 'Sports', icon: '⚽', count: '420K+' },
    { name: 'Beauty', icon: '💄', count: '380K+' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Trade Assurance',
      description: 'Protected transactions with verified suppliers'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with suppliers across Pakistan'
    },
    {
      icon: Truck,
      title: 'Logistics Support',
      description: 'Reliable shipping and delivery solutions'
    },
    {
      icon: Star,
      title: 'Quality Verified',
      description: 'All suppliers undergo strict verification'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Suppliers' },
    { number: '200K+', label: 'Products' },
    { number: '25K+', label: 'Buyers' },
    { number: '150+', label: 'Cities' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">PakTrade</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#products" className="text-gray-600 hover:text-orange-500">Products</a>
                <a href="#suppliers" className="text-gray-600 hover:text-orange-500">Suppliers</a>
                <a href="#services" className="text-gray-600 hover:text-orange-500">Services</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => navigate('/signup')}
              >
                Join Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Leading B2B Marketplace in Pakistan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified suppliers, discover quality products, and grow your business 
            with Pakistan's most trusted wholesale platform.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-lg shadow-lg p-2">
              <Input
                placeholder="Search for products, suppliers, or categories..."
                className="flex-1 border-0 text-lg focus-visible:ring-0"
              />
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 px-8"
                onClick={() => navigate('/products')}
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-gray-500">Popular searches:</span>
            {['Electronics', 'Textiles', 'Machinery', 'Home Goods'].map((term) => (
              <Badge key={term} variant="secondary" className="cursor-pointer hover:bg-orange-100">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} products</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PakTrade?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the tools and services you need to succeed in B2B trade
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-2xl font-bold">For Buyers</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Source quality products from verified suppliers with competitive prices and reliable delivery.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <Zap className="h-4 w-4 text-blue-500 mr-2" />
                    Instant supplier matching
                  </li>
                  <li className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-blue-500 mr-2" />
                    Secure payment protection
                  </li>
                  <li className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                    Bulk pricing advantages
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => navigate('/signup')}
                >
                  Start Buying
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* For Suppliers */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Store className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-2xl font-bold">For Suppliers</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Expand your business reach and connect with buyers across Pakistan and beyond.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-green-500 mr-2" />
                    Access to 25K+ buyers
                  </li>
                  <li className="flex items-center text-sm">
                    <Globe className="h-4 w-4 text-green-500 mr-2" />
                    Global market exposure
                  </li>
                  <li className="flex items-center text-sm">
                    <Package className="h-4 w-4 text-green-500 mr-2" />
                    Easy product listing
                  </li>
                </ul>
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => navigate('/signup')}
                >
                  Start Selling
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold">PakTrade</span>
              </div>
              <p className="text-gray-400 text-sm">
                Pakistan's leading B2B marketplace connecting buyers and suppliers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Search Products</a></li>
                <li><a href="#" className="hover:text-white">Request Quotes</a></li>
                <li><a href="#" className="hover:text-white">Trade Assurance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Sell on PakTrade</a></li>
                <li><a href="#" className="hover:text-white">Supplier Membership</a></li>
                <li><a href="#" className="hover:text-white">Learning Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Report Issues</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 PakTrade. All rights reserved. | Build Successful, API Keys Secured</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlibabaInspiredHome;
