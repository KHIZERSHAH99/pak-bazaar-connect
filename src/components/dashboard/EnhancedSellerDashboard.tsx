import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Package, Store, MessageSquare, Bell, 
  TrendingUp, DollarSign, Clock, CheckCircle 
} from 'lucide-react';
import OrderManagementCompact from '@/components/orders/OrderManagementCompact';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useQuery } from '@tanstack/react-query';
import { getSellerOrders } from '@/lib/orders-enhanced';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const EnhancedSellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch seller orders for stats
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getSellerOrders,
  });

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    confirmedOrders: orders.filter(order => order.status === 'confirmed').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,
    totalSpent: orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)
  };

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Find products from verified wholesalers',
      icon: Package,
      action: () => navigate('/products'),
      color: 'bg-blue-500'
    },
    {
      title: 'Browse Shops',
      description: 'Explore wholesale shops',
      icon: Store,
      action: () => navigate('/dashboard/browse-shops'),
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Seller Dashboard</h1>
          <p className="text-muted-foreground font-poppins mt-1">Welcome back! Manage your purchases and orders</p>
        </div>
        <Button
          onClick={() => navigate('/products')}
          className="bg-primary hover:bg-primary/90 font-poppins"
        >
          <Package className="h-4 w-4 mr-2" />
          Browse Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="font-poppins">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-poppins">
                <ShoppingCart className="h-4 w-4 mr-2" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="browse" className="font-poppins">
                <Store className="h-4 w-4 mr-2" />
                Browse Shops
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <ShoppingCart className="h-8 w-8 text-primary" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <Card 
                        key={index} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={action.action}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                              <action.icon className="h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium text-gray-900">{action.title}</h4>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders Preview */}
              {!isLoading && orders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.shops?.name || 'Unknown Shop'}</p>
                            <p className="text-sm text-gray-600">Rs. {order.total_amount?.toLocaleString()}</p>
                          </div>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'confirmed' ? 'secondary' :
                            order.status === 'pending' ? 'outline' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab('orders')}
                    >
                      View All Orders
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!isLoading && orders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No Orders Yet</h3>
                    <p className="text-gray-600 font-poppins mb-6">
                      Start browsing products and place your first order to get started!
                    </p>
                    <Button 
                      onClick={() => navigate('/products')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <OrderManagementCompact userRole="seller" />
            </TabsContent>

            <TabsContent value="browse">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins">Browse Wholesale Shops</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Discover verified wholesale suppliers across Pakistan and browse their product catalogs.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard/browse-shops')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Browse All Shops
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationCenter />
          
        </div>
      </div>
    </div>
  );
};

export default EnhancedSellerDashboard;