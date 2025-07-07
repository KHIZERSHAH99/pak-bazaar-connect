
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Store, Package, CreditCard, MessageSquare, BarChart3 } from 'lucide-react';
import WholesalerShops from './WholesalerShops';
import WholesalerProducts from './WholesalerProducts';
import WholesalerAds from './WholesalerAds';
import WholesalerOrders from './WholesalerOrders';
import PaymentMethodsSetup from '@/components/payment/PaymentMethodsSetup';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const WholesalerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shops');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Wholesaler Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="shops" className="font-poppins">
                <Store className="h-4 w-4 mr-2" />
                Shops
              </TabsTrigger>
              <TabsTrigger value="products" className="font-poppins">
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-poppins">
                <BarChart3 className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="ads" className="font-poppins">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ads
              </TabsTrigger>
              <TabsTrigger value="payment" className="font-poppins">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shops">
              <WholesalerShops />
            </TabsContent>

            <TabsContent value="products">
              <WholesalerProducts />
            </TabsContent>

            <TabsContent value="orders">
              <WholesalerOrders />
            </TabsContent>

            <TabsContent value="ads">
              <WholesalerAds />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentMethodsSetup />
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

export default WholesalerDashboard;
