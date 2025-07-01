
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Zap, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react';

const Features: React.FC = () => {
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
              Platform Features
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins">
              Everything you need to grow your B2B business in Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
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

          <Card className="bg-pakistani_green-50 dark:bg-pakistani_green-900/20 border-pakistani_green-200 dark:border-pakistani_green-800">
            <CardHeader>
              <CardTitle className="text-center text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
                Why Choose Pak Bazaar Connect?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Free registration for all users",
                  "No hidden fees or charges",
                  "Local payment methods supported",
                  "Urdu language support",
                  "Mobile-friendly platform",
                  "Dedicated Pakistan market focus"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-pakistani_green-600" />
                    <span className="text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Features;
