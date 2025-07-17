
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Star, MapPin, ArrowUp, MessageSquare } from 'lucide-react';

const Sellers: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout 
      title="Sellers - Pak Bazaar Connect"
      description="Connect with verified retailers across Pakistan"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
              Our Verified Sellers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins mb-6">
              Connect with verified retailers across Pakistan
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700">
                Join as Seller
              </Button>
              <Button variant="outline">
                Browse Products
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((seller) => (
              <Card key={seller} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <Users className="w-5 h-5 text-pakistani_green-600" />
                    Seller {seller}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-pakistani_green-600" />
                      <span className="font-poppins">Karachi, Pakistan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-poppins">4.8 (125 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">
                      Specializing in electronics and consumer goods with 5+ years experience.
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action Section */}
          <div className="mt-16 text-center">
            <Card className="bg-pakistani_green-50 dark:bg-pakistani_green-900/20 border-pakistani_green-200 dark:border-pakistani_green-800">
              <CardContent className="py-12">
                <h2 className="text-2xl font-bold text-pakistani_green-800 dark:text-pakistani_green-200 mb-4 font-poppins">
                  Ready to Start Selling?
                </h2>
                <p className="text-pakistani_green-700 dark:text-pakistani_green-300 mb-6 font-poppins">
                  Join thousands of successful sellers on Pakistan's largest B2B marketplace
                </p>
                <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700">
                  Get Started Today
                </Button>
              </CardContent>
            </Card>
          </div>
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

export default Sellers;
