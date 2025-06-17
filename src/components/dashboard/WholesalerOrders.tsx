
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const WholesalerOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 font-poppins">Incoming Orders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Package className="w-5 h-5" />
            Orders to Fulfill
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Manage orders from retailers. Process orders, update status, and coordinate shipments.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-poppins text-sm">
              📦 No incoming orders yet. Promote your products to attract more customers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesalerOrders;
