
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, TrendingUp, AlertTriangle, Shield, Activity, Video, Eye, ClipboardList, Store, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Link } from 'react-router-dom';

export const EnhancedAdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, orders, roleRequests, shops, products] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('role_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);

      const pendingOrders = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending');

      return {
        totalUsers: users.count || 0,
        totalOrders: orders.count || 0,
        totalShops: shops.count || 0,
        totalProducts: products.count || 0,
        pendingRoleRequests: roleRequests.count || 0,
        pendingOrders: pendingOrders.count || 0,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quickActions = [
    { label: 'User Management', path: '/dashboard/admin/users', icon: Users, badge: stats?.pendingRoleRequests, desc: 'Manage users, roles & suspensions' },
    { label: 'Order Oversight', path: '/dashboard/admin/orders', icon: ClipboardList, badge: stats?.pendingOrders, desc: 'Monitor & manage all orders' },
    { label: 'Moderation', path: '/dashboard/admin/moderation', icon: Eye, badge: stats?.pendingRoleRequests, desc: 'Approve shops & products' },
    { label: 'Platform Analytics', path: '/dashboard/admin/analytics', icon: TrendingUp, badge: 0, desc: 'Revenue, growth & trends' },
    { label: 'Tutorial Manager', path: '/dashboard/tutorial-manager', icon: Video, badge: 0, desc: 'Manage video tutorials' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin Panel' }
      ]} />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1 font-poppins">Admin Command Center</h1>
        <p className="text-muted-foreground font-poppins">Full platform control & monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Users', value: stats?.totalUsers, icon: Users },
          { label: 'Orders', value: stats?.totalOrders, icon: ShoppingBag },
          { label: 'Shops', value: stats?.totalShops, icon: Store },
          { label: 'Products', value: stats?.totalProducts, icon: Package },
          { label: 'Pending', value: (stats?.pendingRoleRequests || 0) + (stats?.pendingOrders || 0), icon: AlertTriangle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-1">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                {stat.label === 'Pending' && (stat.value || 0) > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{stat.value}</Badge>
                )}
              </div>
              <div className="text-2xl font-bold">{stat.value || 0}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Controls
          </CardTitle>
          <CardDescription>Quick access to all management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Button variant="outline" className="w-full h-auto py-4 flex-col items-start gap-1 relative">
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{action.label}</span>
                    {(action.badge || 0) > 0 && (
                      <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 animate-pulse">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{action.desc}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Database', status: 'Online' },
              { label: 'Auth Service', status: 'Active' },
              { label: 'File Storage', status: 'Available' },
              { label: 'Payments', status: 'Development' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">{item.label}</span>
                <Badge variant={item.status === 'Development' ? 'secondary' : 'default'} className="text-xs">
                  {item.status === 'Development' ? '🔄' : '✓'} {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SecurityMonitor />
    </div>
  );
};
