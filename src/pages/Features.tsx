
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Zap, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Star,
  TrendingUp,
  ArrowUp
} from 'lucide-react';

const Features: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-pakistani_green-600" />,
      title: "Secure Transactions",
      description: "End-to-end encryption and secure payment processing for all your business transactions."
    },
    {
      icon: <Users className="w-8 h-8 text-pakistani_green-600" />,
      title: "Verified Sellers",
      description: "All sellers are thoroughly verified to ensure legitimate business relationships."
    },
    {
      icon: <Zap className="w-8 h-8 text-pakistani_green-600" />,
      title: "Fast Processing",
      description: "Quick order processing and real-time updates on all your business activities."
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-pakistani_green-600" />,
      title: "Bulk Ordering",
      description: "Efficient bulk ordering system designed for wholesale and retail businesses."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-pakistani_green-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support with AI chatbot and human assistance."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-pakistani_green-600" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and insights to grow your business."
    }
  ];

  return (
    <Layout 
      title="Features - Pak Bazaar Connect"
      description="Discover powerful features designed for B2B success in Pakistan"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
              Platform Features
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins mb-6">
              Everything you need to grow your B2B business in Pakistan
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700">
                Get Started Free
              </Button>
              <Button variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-poppins">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 font-poppins">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why Choose Us Section */}
          <Card className="bg-pakistani_green-50 dark:bg-pakistani_green-900/20 border-pakistani_green-200 dark:border-pakistani_green-800 mb-12">
            <CardHeader>
              <CardTitle className="text-center text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
                Why Choose Pak Bazaar Connect?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Free registration for all users",
                  "Transparent pricing model",
                  "Local payment methods supported",
                  "Urdu language support",
                  "Mobile-friendly platform",
                  "Dedicated Pakistan market focus"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-pakistani_green-600 flex-shrink-0" />
                    <span className="text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="py-8">
                <TrendingUp className="w-12 h-12 text-pakistani_green-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-foreground mb-2 font-poppins">10,000+</h3>
                <p className="text-muted-foreground font-poppins">Active Users</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-8">
                <ShoppingCart className="w-12 h-12 text-pakistani_green-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-foreground mb-2 font-poppins">50,000+</h3>
                <p className="text-muted-foreground font-poppins">Orders Processed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-8">
                <Star className="w-12 h-12 text-pakistani_green-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-foreground mb-2 font-poppins">4.8/5</h3>
                <p className="text-muted-foreground font-poppins">User Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4 font-poppins">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 font-poppins opacity-90">
                Join Pakistan's fastest-growing B2B marketplace today
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" size="lg">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-pakistani_green-600">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Top Button - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={scrollToTop}
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="icon"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Features;
