import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, ShoppingBag, TrendingUp, Shield, Zap, Users, Globe, ArrowRight, CheckCircle, Star, Award, Heart, Flag } from 'lucide-react';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const Index = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const features = [{
    icon: <Store className="h-8 w-8" />,
    title: 'For Wholesalers',
    description: 'Create shops, list products, and reach retailers across Pakistan',
    color: 'from-blue-500 to-blue-600',
    benefits: ['Unlimited product listings', 'Advanced analytics', 'Promotional ads']
  }, {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: 'For Sellers',
    description: 'Source quality products directly from verified wholesalers',
    color: 'from-purple-500 to-purple-600',
    benefits: ['Bulk pricing', 'Quick ordering', 'Inventory management']
  }, {
    icon: <Shield className="h-8 w-8" />,
    title: 'Secure Trading',
    description: 'End-to-end security with verified businesses and secure payments',
    color: 'from-green-500 to-green-600',
    benefits: ['Business verification', 'Secure payments', 'Dispute resolution']
  }];
  const stats = [{
    number: '10,000+',
    label: 'Active Businesses',
    icon: <Users className="h-5 w-5" />
  }, {
    number: '500+',
    label: 'Cities Covered',
    icon: <Globe className="h-5 w-5" />
  }, {
    number: '2.5%',
    label: 'Low Commission',
    icon: <TrendingUp className="h-5 w-5" />
  }, {
    number: '24/7',
    label: 'Support',
    icon: <Heart className="h-5 w-5" />
  }];
  return <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-pakistani_green-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pakistani_green-700 via-pakistani_green-600 to-green-600 text-white py-3 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative flex items-center justify-center">
          <Flag className="w-5 h-5 mr-2 animate-bounce" />
          <p className="font-semibold text-sm md:text-base font-poppins">
            🎉 Join Now! Free Ads for First 10 Wholesalers! Limited Time Offer
          </p>
          <Star className="w-5 h-5 ml-2 animate-spin" />
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white text-2xl font-bold">PBC</span>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-pakistani_green-800 to-green-700 bg-clip-text text-transparent hidden md:inline">
              Pak Bazaar Connect
            </span>
          </Link>
          
          <nav className="flex items-center space-x-3">
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-pakistani_green-700 hover:bg-pakistani_green-50 font-poppins">
                Browse Products
              </Button>
            </Link>
            {user ? <Link to="/dashboard">
                <Button size="sm" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 font-poppins shadow-lg">
                  Dashboard
                </Button>
              </Link> : <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50 font-poppins">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 font-poppins shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pakistani_green-600/10 via-transparent to-green-600/10"></div>
        <div className="container mx-auto text-center relative">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-pakistani_green-100 to-green-100 text-pakistani_green-800 border-pakistani_green-200 font-poppins">
            <Award className="w-4 h-4 mr-2" />
            Pakistan's Leading B2B Marketplace
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins">
            <span className="bg-gradient-to-r from-pakistani_green-800 via-pakistani_green-600 to-green-600 bg-clip-text text-transparent">
              Connect, Trade & Grow
            </span>
            <br />
            <span className="text-gray-800">Your Business</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-poppins">Join thousands of Pakistani businesses trading on our secure platform. verified sellers, and instant payments.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white px-8 py-4 text-lg font-poppins shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="border-2 border-pakistani_green-600 text-pakistani_green-700 hover:bg-pakistani_green-50 px-8 py-4 text-lg font-poppins">
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-gradient-to-r from-pakistani_green-100 to-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <div className="text-pakistani_green-600">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 font-poppins">{stat.number}</div>
                <div className="text-gray-600 font-poppins text-sm">{stat.label}</div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-poppins">
              Why Choose Pak Bazaar Connect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-poppins">
              Designed specifically for Pakistani businesses with local payment methods and regional expertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-poppins">{feature.title}</h3>
                <p className="text-gray-600 mb-6 font-poppins leading-relaxed">{feature.description}</p>
                
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => <li key={idx} className="flex items-center text-sm text-gray-700 font-poppins">
                      <CheckCircle className="h-4 w-4 text-pakistani_green-600 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>)}
                </ul>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-pakistani_green-600 via-pakistani_green-700 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="container mx-auto text-center relative">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Zap className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-poppins opacity-90">
            Join Pakistan's fastest-growing B2B marketplace. Get started in minutes with our simple registration process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-pakistani_green-700 hover:bg-gray-100 px-8 py-4 text-lg font-bold font-poppins shadow-2xl hover:shadow-3xl transition-all duration-300">
                Create Free Account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="border-2 border-white hover:bg-white/10 px-8 py-4 text-lg font-poppins backdrop-blur-sm text-pakistani_green-950">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md mr-3">
              <span className="text-white text-lg font-bold">PBC</span>
            </div>
            <span className="text-lg font-bold font-poppins">Pak Bazaar Connect</span>
          </div>
          <p className="text-pakistani_green-200 mb-4 font-poppins">
            Connecting Pakistani businesses for sustainable growth
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span className="flex items-center font-poppins">
              <Shield className="h-4 w-4 mr-1" />
              Build Successful, API Keys Secured
            </span>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
