
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

const SellerOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Orders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <ShoppingBag className="w-5 h-5" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Track your orders from wholesalers. View order status, delivery information, and order history.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-poppins text-sm">
              📋 No orders placed yet. Browse shops to find products and place your first order.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerOrders;
