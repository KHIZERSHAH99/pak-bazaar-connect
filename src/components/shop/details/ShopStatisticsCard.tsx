
import React from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { Shop, Product } from '@/lib/types';

interface ShopStatisticsCardProps {
  shop: Shop | null | undefined;
  productsCount: number;
}

const ShopStatisticsCard: React.FC<ShopStatisticsCardProps> = ({ shop, productsCount }) => {
  if (!shop) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 font-poppins">Shop Statistics</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-poppins">Total Products</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 font-poppins">{productsCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-poppins">Commission Rate</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 font-poppins">{shop.commission_rate || 5}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-poppins">Shop Rating</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            {/* Mock rating, replace with actual data if available */}
            <span className="font-semibold text-gray-800 dark:text-gray-200 ml-1 font-poppins">4.5</span> 
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShopStatisticsCard;
