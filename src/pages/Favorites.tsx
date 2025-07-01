
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">Favorites</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <Heart className="w-5 h-5" />
                Your Favorite Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 font-poppins">
                Save products and shops you're interested in to easily find them later.
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 font-poppins text-sm">
                  ❤️ No favorites yet. Start browsing products and shops to add them to your favorites!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Favorites;
