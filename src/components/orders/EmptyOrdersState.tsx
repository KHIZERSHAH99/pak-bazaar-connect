
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ShoppingBag } from 'lucide-react';

interface EmptyOrdersStateProps {
  hasOrders: boolean;
  userRole: 'wholesaler' | 'seller';
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ hasOrders, userRole }) => {
  const Icon = userRole === 'wholesaler' ? Package : ShoppingBag;
  
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Icon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-600 mb-2 font-poppins">
          {hasOrders ? 'No orders match your filters' : 'No orders yet'}
        </p>
        <p className="text-gray-500 font-poppins">
          {hasOrders 
            ? 'Try adjusting your search or filter criteria.'
            : userRole === 'wholesaler'
              ? 'Orders from retailers will appear here once they start purchasing from your shops.'
              : 'Your orders from wholesalers will appear here.'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyOrdersState;
