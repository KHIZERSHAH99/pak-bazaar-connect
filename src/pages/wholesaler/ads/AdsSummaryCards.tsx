
import React from 'react';
import { BarChart3, Package } from 'lucide-react';
import { Ad } from '@/lib/ads';

interface AdsSummaryCardsProps {
  ads: Ad[];
}

const AdsSummaryCards: React.FC<AdsSummaryCardsProps> = ({ ads }) => {
  const getActiveAdsCount = () => ads.filter(ad => ad.status === 'active' && !ad.is_auto_stopped).length;
  const getTotalSpend = () => ads.reduce((sum, ad) => sum + (ad.current_spend || 0), 0);
  const getTotalOrders = () => ads.reduce((sum, ad) => sum + (ad.total_orders || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">Active Campaigns</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">{getActiveAdsCount()}</div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Total Orders</span>
        </div>
        <div className="text-2xl font-bold text-green-600">{getTotalOrders()}</div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-800">Total Spend</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">
          PKR {getTotalSpend().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AdsSummaryCards;
