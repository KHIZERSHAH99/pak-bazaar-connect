
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, MessageSquare, TrendingUp, Store } from 'lucide-react';
import SellerOrders from './SellerOrders';

const RestoredSellerDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-poppins">
            Seller Dashboard
          </h1>
          <p className="text-gray-600 font-poppins mt-1">
            Manage your orders and browse products
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/products'}
          className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins"
        >
          <Package className="h-4 w-4 mr-2" />
          Browse Products
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">24</div>
              <ShoppingCart className="h-8 w-8 text-pakistani_green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1 font-poppins">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">8</div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-poppins">
              Pending confirmation
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 font-poppins">
              Available Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 font-poppins">156</div>
              <Store className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-poppins">
              Ready to order from
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Orders Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <ShoppingCart className="h-5 w-5 text-pakistani_green-600" />
                My Orders
              </CardTitle>
              <CardDescription className="font-poppins">
                Track and manage your order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SellerOrders />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start font-poppins"
                onClick={() => window.location.href = '/dashboard/browse-shops'}
              >
                <Store className="h-4 w-4 mr-2" />
                Browse Shops
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start font-poppins"
                onClick={() => window.location.href = '/dashboard/chat'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat Support
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start font-poppins"
                onClick={() => window.location.href = '/profile'}
              >
                <Package className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-poppins">Order confirmed</p>
                    <p className="text-xs text-gray-500 font-poppins">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-poppins">New message</p>
                    <p className="text-xs text-gray-500 font-poppins">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-poppins">Order placed</p>
                    <p className="text-xs text-gray-500 font-poppins">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestoredSellerDashboard;
