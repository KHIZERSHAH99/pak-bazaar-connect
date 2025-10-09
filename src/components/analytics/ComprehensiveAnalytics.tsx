
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, MessageSquare, ShoppingCart, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { getSellerAnalytics } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  views: number;
  messages: number;
  orders: number;
  revenue: number;
  dailyStats: Array<{
    date: string;
    views: number;
    orders: number;
  }>;
}

interface OrdersByStatus {
  status: string;
  count: number;
  color: string;
}

const ComprehensiveAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, profile]);

  const fetchAnalytics = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const data = await getSellerAnalytics(timeframe);
      setAnalytics(data);

      // Get additional analytics data
      await fetchOrdersByStatus();
      await fetchTopProducts();
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByStatus = async () => {
    if (!profile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (!shops?.length) return;

      const shopIds = shops.map(shop => shop.id);
      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .in('shop_id', shopIds);

      if (orders) {
        const statusCounts = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusData: OrdersByStatus[] = [
          { status: 'pending', count: statusCounts.pending || 0, color: '#fbbf24' },
          { status: 'confirmed', count: statusCounts.confirmed || 0, color: '#10b981' },
          { status: 'rejected', count: statusCounts.rejected || 0, color: '#ef4444' },
          { status: 'completed', count: statusCounts.completed || 0, color: '#3b82f6' },
        ];

        setOrdersByStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching orders by status:', error);
    }
  };

  const fetchTopProducts = async () => {
    if (!profile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (!shops?.length) return;

      const shopIds = shops.map(shop => shop.id);
      
      // Get products with view counts from the new product_views table
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image
        `)
        .in('shop_id', shopIds)
        .eq('is_active', true)
        .limit(5);

      if (products) {
        // Get view counts for each product
        const productsWithViews = await Promise.all(
          products.map(async (product) => {
            const { data: views } = await supabase
              .from('product_views')
              .select('id')
              .eq('product_id', product.id);
            
            return {
              ...product,
              views: views?.length || 0
            };
          })
        );

        // Sort by views and take top 5
        const sortedProducts = productsWithViews
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{analytics.views}</p>
              <p className="text-xs text-green-600">Real-time tracking</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Messages</p>
              <p className="text-2xl font-bold">{analytics.messages}</p>
              <p className="text-xs text-gray-500">Customer inquiries</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold">{analytics.orders}</p>
              <p className="text-xs text-gray-500">Total orders</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold">PKR {analytics.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total earnings</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs value={timeframe} onValueChange={setTimeframe}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>
        
        <TabsContent value={timeframe} className="space-y-6 mt-6">
          {/* Performance Chart */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Views" />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Top Viewed Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No product data available</p>
                  ) : (
                    topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">PKR {product.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.views} views</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAnalytics;
