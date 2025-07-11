
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Store, Package, CreditCard, MessageSquare, BarChart3, Ticket, TrendingUp, ShoppingCart } from 'lucide-react';
import ShopsManagement from './ShopsManagement';
import ProductsManagement from './ProductsManagement';
import AdsManagement from './AdsManagement';
import WholesalerOrders from './WholesalerOrders';
import PaymentMethodsSetup from '@/components/payment/PaymentMethodsSetup';
import CouponManagement from '@/components/coupons/CouponManagement';

const RestoredWholesalerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-poppins">
            Wholesaler Dashboard
          </h1>
          <p className="text-gray-600 font-poppins mt-1">
            Manage your business operations and sales
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Total Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">1</div>
              <Store className="h-8 w-8 text-pakistani_green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1 font-poppins">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Active shop
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">42</div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-poppins">
              Listed products
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">18</div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-green-600 mt-1 font-poppins">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5 this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">PKR 45K</div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1 font-poppins">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +18% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Business Management</CardTitle>
          <CardDescription className="font-poppins">
            Manage all aspects of your wholesale business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="overview" className="font-poppins text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="shops" className="font-poppins text-xs sm:text-sm">
                <Store className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Shops</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="font-poppins text-xs sm:text-sm">
                <Package className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-poppins text-xs sm:text-sm">
                <ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="ads" className="font-poppins text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Ads</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="font-poppins text-xs sm:text-sm">
                <Ticket className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Coupons</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium font-poppins">Order #1234</p>
                          <p className="text-sm text-gray-600 font-poppins">PKR 2,500</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-poppins">
                          Confirmed
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium font-poppins">Order #1235</p>
                          <p className="text-sm text-gray-600 font-poppins">PKR 1,800</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-poppins">
                          Pending
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
                      <Package className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                    <Button variant="outline" className="w-full justify-start font-poppins">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Create Advertisement
                    </Button>
                    <Button variant="outline" className="w-full justify-start font-poppins">
                      <Ticket className="h-4 w-4 mr-2" />
                      Generate Coupon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestoredWholesalerDashboard;
