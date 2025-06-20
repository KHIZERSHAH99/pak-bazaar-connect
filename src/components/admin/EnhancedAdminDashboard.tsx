
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, FileText, TrendingUp, AlertTriangle, CheckCircle, Shield, Activity, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { EnhancedCommissionTracker } from '@/components/commission/EnhancedCommissionTracker';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const EnhancedAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
      }
    },
    retry: 2,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-muted-foreground font-poppins">
          {t('loading') || 'Loading...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 font-poppins">
          Error loading dashboard data. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t('dashboard') || 'Dashboard', href: '/dashboard' },
        { label: t('admin_panel') || 'Admin Panel' }
      ]} />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 font-poppins">
          {t('enhanced_admin_dashboard') || 'Enhanced Admin Dashboard'}
        </h1>
        <p className="text-muted-foreground font-poppins">
          {t('platform_management_description') || 'Comprehensive platform management and monitoring'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">
              {t('total_users') || 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground font-poppins">
              {t('registered_users') || 'Registered users'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">
              {t('total_orders') || 'Total Orders'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground font-poppins">
              {t('platform_orders') || 'Platform orders'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">
              {t('total_ads') || 'Total Ads'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAds || 0}</div>
            <p className="text-xs text-muted-foreground font-poppins">
              {t('advertisements') || 'Advertisements'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">
              {t('pending_appro vals') || 'Pending Approvals'}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRoleRequests || 0}</div>
            <p className="text-xs text-muted-foreground font-poppins">
              {t('role_requests') || 'Role requests'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">
              {t('commissions') || 'Commissions'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCommissions || 0}</div>
            <p className="text-xs text-muted-foreground font-poppins">
              {t('total_records') || 'Total records'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Activity className="h-5 w-5" />
              {t('quick_actions') || 'Quick Actions'}
            </CardTitle>
            <CardDescription className="font-poppins">
              {t('platform_management_tools') || 'Platform management tools'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/dashboard/ad-approvals">
              <Button className="w-full justify-start font-poppins hover:bg-gray-50 dark:hover:bg-gray-800" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t('review_advertisements') || 'Review Advertisements'}
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="w-full justify-start font-poppins hover:bg-gray-50 dark:hover:bg-gray-800" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                {t('full_admin_panel') || 'Full Admin Panel'}
              </Button>
            </Link>
            <Link to="/dashboard/chat">
              <Button className="w-full justify-start font-poppins hover:bg-gray-50 dark:hover:bg-gray-800" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('support_chat') || 'Support Chat'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">
              {t('platform_status') || 'Platform Status'}
            </CardTitle>
            <CardDescription className="font-poppins">
              {t('system_health_performance') || 'System health and performance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-poppins">{t('database_connection') || 'Database Connection'}</span>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✓ {t('online') || 'Online'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-poppins">{t('authentication_service') || 'Authentication Service'}</span>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✓ {t('active') || 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-poppins">{t('file_storage') || 'File Storage'}</span>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✓ {t('available') || 'Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-poppins">{t('payment_processing') || 'Payment Processing'}</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                🔄 {t('development') || 'Development'}
              </Badge>
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
