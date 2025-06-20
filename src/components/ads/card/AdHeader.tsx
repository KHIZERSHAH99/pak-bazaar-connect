
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface AdHeaderProps {
  headline: string;
  status: string;
  isAutoStopped: boolean;
  productInfo?: {
    name: string;
    price: number;
    image?: string;
  };
}

const AdHeader: React.FC<AdHeaderProps> = ({ headline, status, isAutoStopped, productInfo }) => {
  const getStatusBadge = (status: string, isAutoStopped: boolean) => {
    if (isAutoStopped) {
      return <Badge className="bg-orange-100 text-orange-800">Auto Stopped</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {headline}
        </CardTitle>
        {getStatusBadge(status, isAutoStopped)}
      </div>
      
      {productInfo && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {productInfo.image && (
            <img 
              src={productInfo.image} 
              alt={productInfo.name}
              className="w-6 h-6 object-cover rounded"
            />
          )}
          <span>{productInfo.name} - {formatCurrency(productInfo.price)}</span>
        </div>
      )}
    </CardHeader>
  );
};

export default AdHeader;
