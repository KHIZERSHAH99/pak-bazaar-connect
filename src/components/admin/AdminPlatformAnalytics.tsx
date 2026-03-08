import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, ShoppingCart, Store, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)'];

const AdminPlatformAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-platform-analytics'],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30).toISOString();
      const sevenDaysAgo = subDays(now, 7).toISOString();

      const [
        totalUsers, totalOrders, totalShops, totalProducts,
        recentUsers, recentOrders, usersByRole,
        ordersByStatus, revenueData
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('profiles').select('role'),
        supabase.from('orders').select('status'),
        supabase.from('orders').select('total_amount, created_at, status')
          .gte('created_at', thirtyDaysAgo)
          .in('status', ['delivered', 'confirmed', 'processing', 'shipped', 'pending']),
      ]);

      // Role distribution
      const roleDist = (usersByRole.data || []).reduce((acc: any, u: any) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});

      // Order status distribution
      const statusDist = (ordersByStatus.data || []).reduce((acc: any, o: any) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      // Daily revenue for last 30 days
      const dailyRevenue: Record<string, number> = {};
      const dailyOrders: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(now, i), 'MMM d');
        dailyRevenue[day] = 0;
        dailyOrders[day] = 0;
      }
      (revenueData.data || []).forEach((o: any) => {
        const day = format(new Date(o.created_at), 'MMM d');
        if (dailyRevenue[day] !== undefined) {
          dailyRevenue[day] += Number(o.total_amount || 0);
          dailyOrders[day]++;
        }
      });

      const totalRev = (revenueData.data || []).reduce((sum, o: any) => sum + Number(o.total_amount || 0), 0);

      return {
        totalUsers: totalUsers.count || 0,
        totalOrders: totalOrders.count || 0,
        totalShops: totalShops.count || 0,
        totalProducts: totalProducts.count || 0,
        newUsersWeek: recentUsers.count || 0,
        newOrdersWeek: recentOrders.count || 0,
        totalRevenue30d: totalRev,
        roleDist: Object.entries(roleDist).map(([name, value]) => ({ name, value })),
        statusDist: Object.entries(statusDist).map(([name, value]) => ({ name: name.replace('_', ' '), value })),
        revenueChart: Object.entries(dailyRevenue).map(([day, amount]) => ({ day, amount })),
        ordersChart: Object.entries(dailyOrders).map(([day, count]) => ({ day, count })),
      };
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/dashboard/admin' },
        { label: 'Platform Analytics' }
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">Platform Analytics</h1>
        <p className="text-muted-foreground font-poppins">Comprehensive platform performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, change: stats?.newUsersWeek || 0, changeLabel: 'this week' },
          { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, change: stats?.newOrdersWeek || 0, changeLabel: 'this week' },
          { label: 'Total Shops', value: stats?.totalShops || 0, icon: Store },
          { label: '30d Revenue', value: `Rs ${(stats?.totalRevenue30d || 0).toLocaleString()}`, icon: DollarSign },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-poppins">{kpi.label}</p>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground font-poppins">{kpi.value}</p>
              {kpi.change !== undefined && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +{kpi.change} {kpi.changeLabel}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-poppins">Revenue (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-poppins">Orders (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.ordersChart || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-poppins">User Roles</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={stats?.roleDist || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {(stats?.roleDist || []).map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {(stats?.roleDist || []).map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm capitalize font-poppins">{item.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-poppins">Order Statuses</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={stats?.statusDist || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {(stats?.statusDist || []).map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {(stats?.statusDist || []).map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm capitalize font-poppins">{item.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPlatformAnalytics;
