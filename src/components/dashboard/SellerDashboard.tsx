
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, MessageSquare, Bell } from 'lucide-react';
import SellerOrders from './SellerOrders';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Seller Dashboard</h1>
        <Button
          onClick={() => window.location.href = '/products'}
          className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
        >
          <Package className="h-4 w-4 mr-2" />
          Browse Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="orders" className="font-poppins">
                <ShoppingCart className="h-4 w-4 mr-2" />
                My Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <SellerOrders />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
