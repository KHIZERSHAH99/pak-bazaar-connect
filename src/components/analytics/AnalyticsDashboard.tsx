import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Eye, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';
import { analytics } from '@/lib/analytics-tracker';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface AnalyticsData {
  total_events: number;
  page_views: number;
  product_views: number;
  orders_created: number;
  unique_sessions: number;
  events_by_type: Record<string, number>;
  daily_stats: Record<string, number>;
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setUserRole(profile?.role || '');

      // Fetch analytics based on role
      const analyticsData = await analytics.getAnalyticsSummary(
        profile?.role === 'admin' ? undefined : user.id,
        timeRange
      );

      if (analyticsData) {
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const dailyChartData = Object.entries(data.daily_stats)
    .map(([date, count]) => ({ date, count }))
    .slice(-14); // Last 14 days

  const eventTypeData = Object.entries(data.events_by_type)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-poppins">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{data.total_events.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Page Views</p>
                <p className="text-2xl font-bold">{data.page_views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Product Views</p>
                <p className="text-2xl font-bold">{data.product_views.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders Created</p>
                <p className="text-2xl font-bold">{data.orders_created.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1B5E20" 
                  strokeWidth={2}
                  dot={{ fill: '#1B5E20' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle>Top Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1B5E20" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Session Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-pakistani_green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Unique Sessions</p>
              <p className="text-xl font-bold">{data.unique_sessions}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Avg Events/Session</p>
              <p className="text-xl font-bold">
                {data.unique_sessions > 0 
                  ? (data.total_events / data.unique_sessions).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xl font-bold">
                {data.product_views > 0
                  ? ((data.orders_created / data.product_views) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;