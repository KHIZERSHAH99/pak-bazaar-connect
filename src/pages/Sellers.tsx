
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, MapPin } from 'lucide-react';

const Sellers: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
              Our Sellers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins">
              Connect with verified retailers across Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((seller) => (
              <Card key={seller} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <Users className="w-5 h-5" />
                    Seller {seller}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span className="font-poppins">Karachi, Pakistan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-poppins">4.8 (125 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">
                      Specializing in electronics and consumer goods with 5+ years experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sellers;
