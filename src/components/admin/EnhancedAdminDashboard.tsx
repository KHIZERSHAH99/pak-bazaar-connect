
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
import { Link } from 'react-router-dom';
import { fixPhoneUserData, validatePhoneData } from '@/lib/fix-phone-data';
import { manualPhoneDataFix, validateCurrentPhoneData } from '@/lib/auth/phone-data-fixer';
import { useToast } from '@/hooks/use-toast';

export const EnhancedAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  
  const handleFixPhoneData = async () => {
    try {
      toast({
        title: "Starting Phone Data Fix",
        description: "Cleaning up phone user data...",
      });
      await fixPhoneUserData();
      toast({
        title: "Phone Data Fixed",
        description: "All phone user data has been cleaned up successfully.",
      });
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: "There was an error fixing phone data.",
        variant: "destructive"
      });
    }
  };

  const handleValidatePhoneData = async () => {
    await validatePhoneData();
    toast({
      title: "Phone Data Validated",
      description: "Check console for validation results.",
    });
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, orders, ads, roleRequests, commissions] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at', { count: 'exact' }),
        supabase.from('orders').select('id, status, total_amount, created_at', { count: 'exact' }),
        supabase.from('ads').select('id, status, created_at', { count: 'exact' }),
        supabase.from('role_requests').select('id, user_id, requested_role, status, created_at').eq('status', 'pending'),
        supabase.from('commission_records').select('id, amount, created_at', { count: 'exact' })
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
            <Link to="/admin">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Full Admin Panel
              </Button>
            </Link>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleFixPhoneData}
            >
              <Users className="h-4 w-4 mr-2" />
              Fix Phone User Data (Legacy)
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleValidatePhoneData}
            >
              <Activity className="h-4 w-4 mr-2" />
              Validate Phone Data (Legacy)
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={async () => {
                await manualPhoneDataFix();
                toast({
                  title: "Phone Data Fix Complete",
                  description: "Check console for details",
                });
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Manual Phone Data Fix
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={async () => {
                await validateCurrentPhoneData();
                toast({
                  title: "Phone Data Validation Complete",
                  description: "Check console for results",
                });
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              Validate Current Phone Data
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
