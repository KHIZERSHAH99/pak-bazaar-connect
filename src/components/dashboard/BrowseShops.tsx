
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BrowseShops: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-poppins">Browse Shops</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input 
            placeholder="Search shops..." 
            className="pl-10 w-64 font-poppins bg-background/50 dark:bg-background/30 backdrop-blur-sm border-pakistani_green-200/30"
          />
        </div>
      </div>
      
      <Card className="bg-background/50 dark:bg-background/30 backdrop-blur-sm border-pakistani_green-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins text-gray-900 dark:text-gray-100">
            <Store className="w-5 h-5" />
            Wholesale Shops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 font-poppins">
            Discover wholesale shops and browse their product catalogs. Find the best deals for your retail business.
          </p>
          <div className="mt-4 p-4 bg-pakistani_green-50/50 dark:bg-pakistani_green-900/30 rounded-lg backdrop-blur-sm">
            <p className="text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins text-sm">
              🛒 Browse verified wholesalers and place bulk orders directly through the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrowseShops;
