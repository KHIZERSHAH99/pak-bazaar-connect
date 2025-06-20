
import React from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  return (
    <Layout>
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">My Favorites</h1>
          </div>
          
          <Card className="p-12 text-center">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 font-poppins">No favorites yet</h3>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">
                Start adding products and shops to your favorites to see them here.
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default Favorites;
