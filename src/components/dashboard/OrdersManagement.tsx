
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const OrdersManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 font-poppins">Orders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <ShoppingCart className="w-5 h-5" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            View and manage all your orders. Track order status, process shipments, and communicate with customers.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-poppins text-sm">
              📦 No orders yet. Start promoting your products to get your first order!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;
