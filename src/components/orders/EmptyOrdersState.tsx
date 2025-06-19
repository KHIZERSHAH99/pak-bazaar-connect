
import React from 'react';
import { Package } from 'lucide-react';

interface EmptyOrdersStateProps {
  hasOrders: boolean;
  userRole: 'wholesaler' | 'seller';
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ hasOrders, userRole }) => {
  return (
    <div className="text-center py-12">
      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasOrders ? 'No orders match your filters' : 'No orders yet'}
      </h3>
      <p className="text-gray-600">
        {hasOrders 
          ? 'Try adjusting your search or filter criteria'
          : userRole === 'seller' 
            ? 'Start placing orders from wholesaler shops'
            : 'Orders will appear here when customers place them'
        }
      </p>
    </div>
  );
};

export default EmptyOrdersState;
