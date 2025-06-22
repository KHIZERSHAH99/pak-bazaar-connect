
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Eye, ShoppingCart, Users, Star, Calendar,
  Download, Filter, RefreshCw, Target, DollarSign, Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: number;
  };
  trends: Array<{
    date: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  products: Array<{
    name: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  demographics: Array<{
    city: string;
    users: number;
    orders: number;
  }>;
}

const COLORS = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50'];

export const EnhancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    initializeAnalytics();
  }, [timeRange]);

  const initializeAnalytics = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view analytics.",
          variant: "destructive"
        });
        return;
      }

      setUserRole(profile.role);
      await loadAnalytics(profile.role, profile.id);
    } catch (error) {
      console.error('Analytics initialization error:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (role: string, userId: string) => {
    try {
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        overview: {
          totalViews: Math.floor(Math.random() * 5000) + 1000,
          totalOrders: Math.floor(Math.random() * 200) + 50,
          totalRevenue: Math.floor(Math.random() * 100000) + 20000,
          conversionRate: Math.floor(Math.random() * 10) + 2
        },
        trends: Array.from({ length: parseInt(timeRange) }, (_, i) => ({
          date: new Date(Date.now() - (parseInt(timeRange) - i) * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0],
          views: Math.floor(Math.random() * 200) + 50,
          orders: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 5000) + 1000
        })),
        products: [
          { name: "Electronics", views: 1250, orders: 85, revenue: 25000 },
          { name: "Clothing", views: 980, orders: 65, revenue: 18500 },
          { name: "Food Items", views: 750, orders: 45, revenue: 12000 },
          { name: "Machinery", views: 420, orders: 25, revenue: 35000 },
          { name: "Textiles", views: 380, orders: 20, revenue: 8500 }
        ],
        demographics: [
          { city: "Karachi", users: 450, orders: 125 },
          { city: "Lahore", users: 380, orders: 95 },
          { city: "Islamabad", users: 220, orders: 65 },
          { city: "Faisalabad", users: 180, orders: 45 },
          { city: "Multan", users: 150, orders: 35 }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Load analytics error:', error);
      throw error;
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast({
      title: "Export Successful",
      description: "Analytics data has been exported.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your {userRole === 'wholesaler' ? 'sales' : 'marketplace'} performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={initializeAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.overview.totalOrders.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">PKR {analytics.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-pakistani_green-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.overview.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2% vs last period
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="orders" stackId="1" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.products}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" />
                  <Bar dataKey="orders" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.demographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.city}: ${entry.users}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {analytics.demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
