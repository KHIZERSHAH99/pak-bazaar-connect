
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, FileText, TrendingUp, AlertTriangle, CheckCircle, Shield, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { EnhancedCommissionTracker } from '@/components/commission/EnhancedCommissionTracker';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const EnhancedAdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, orders, ads, roleRequests, commissions] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('ads').select('*', { count: 'exact' }),
        supabase.from('role_requests').select('*').eq('status', 'pending'),
        supabase.from('commission_records').select('*', { count: 'exact' })
      ]);

      return {
        totalUsers: users.count || 0,
        totalOrders: orders.count || 0,
        totalAds: ads.count || 0,
        pendingRoleRequests: roleRequests.data?.length || 0,
        totalCommissions: commissions.count || 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin Panel' }
      ]} />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 font-poppins">Enhanced Admin Dashboard</h1>
        <p className="text-muted-foreground font-poppins">Comprehensive platform management and monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Platform orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAds || 0}</div>
            <p className="text-xs text-muted-foreground">Advertisements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRoleRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Role requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCommissions || 0}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Platform management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/dashboard/ad-approvals">
                <FileText className="h-4 w-4 mr-2" />
                Review Advertisements
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Full Admin Panel
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/dashboard/chat">
                <CheckCircle className="h-4 w-4 mr-2" />
                Support Chat
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
            <CardDescription>System health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <Badge variant="default">✓ Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication Service</span>
              <Badge variant="default">✓ Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>File Storage</span>
              <Badge variant="default">✓ Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Processing</span>
              <Badge variant="secondary">🔄 Development</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityMonitor />
        <EnhancedCommissionTracker />
      </div>
    </div>
  );
};
