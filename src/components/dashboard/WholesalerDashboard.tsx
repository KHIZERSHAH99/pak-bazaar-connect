
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Store, Package, CreditCard, MessageSquare, BarChart3, Ticket } from 'lucide-react';
import ShopsManagement from './ShopsManagement';
import ProductsManagement from './ProductsManagement';
import AdsManagement from './AdsManagement';
import WholesalerOrders from './WholesalerOrders';
import PaymentMethodsSetup from '@/components/payment/PaymentMethodsSetup';
import CouponManagement from '@/components/coupons/CouponManagement';
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto gap-1 p-1">
              <TabsTrigger value="shops" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <Store className="h-4 w-4" />
                <span>Shops</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger value="ads" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>Ads</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <Ticket className="h-4 w-4" />
                <span>Coupons</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="font-poppins flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Payment</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shops">
              <ShopsManagement />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="orders">
              <WholesalerOrders />
            </TabsContent>

            <TabsContent value="ads">
              <AdsManagement />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponManagement />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentMethodsSetup />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 bg-black/0">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};

export default WholesalerDashboard;
