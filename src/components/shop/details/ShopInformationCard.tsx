
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, MapPin, Phone } from 'lucide-react';
import type { Shop } from '@/lib/types';

interface ShopInformationCardProps {
  shop: Shop | null | undefined;
}

const ShopInformationCard: React.FC<ShopInformationCardProps> = ({ shop }) => {
  if (!shop) return null;

  const city = shop.cities as { name: string; province: string } | undefined;

  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        {shop.logo ? (
          <img 
            src={shop.logo} 
            alt={shop.name}
            className="w-16 h-16 rounded-lg object-cover border dark:border-gray-700"
          />
        ) : (
          <div className="w-16 h-16 bg-pakistani_green-100 dark:bg-pakistani_green-700/30 rounded-lg flex items-center justify-center">
            <Store className="h-8 w-8 text-pakistani_green-700 dark:text-pakistani_green-300" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 font-poppins">{shop.name}</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="font-poppins">{shop.address}</span>
            </div>
            {city && (
              <div className="flex items-center ml-6"> {/* Indent city/province slightly */}
                <span className="font-poppins">{city.name}, {city.province}</span>
              </div>
            )}
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="font-poppins">{shop.contact}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShopInformationCard;
