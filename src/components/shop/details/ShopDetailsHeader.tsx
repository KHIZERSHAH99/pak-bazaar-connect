
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import type { Shop } from '@/lib/types';

interface ShopDetailsHeaderProps {
  shop: Shop | null | undefined;
  onBack: () => void;
}

const ShopDetailsHeader: React.FC<ShopDetailsHeaderProps> = ({ shop, onBack }) => {
  if (!shop) return null;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Button 
          onClick={onBack} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shops
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 font-poppins">{shop.name}</h1>
      </div>
      {/* Assuming shops are active by default or status is handled elsewhere */}
      <Badge variant="success" className="font-poppins">
        Active Shop
      </Badge>
    </div>
  );
};

export default ShopDetailsHeader;
