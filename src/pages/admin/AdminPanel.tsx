
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  FileText,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, shopsRes, productsRes, ordersRes, adsRes] = await Promise.all([
        supabase.from('profiles').select('id, role').neq('role', 'admin'),
        supabase.from('shops').select('id, commission_rate'),
        supabase.from('products').select('id, price, is_active'),
        supabase.from('orders').select('id, total_amount, status'),
        supabase.from('ads').select('id, status')
      ]);

      const users = usersRes.data || [];
      const shops = shopsRes.data || [];
      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const ads = adsRes.data || [];

      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total_amount), 0);

      const commission = totalRevenue * 0.025; // 2.5% platform commission

      return {
        totalUsers: users.length,
        wholesalers: users.filter(u => u.role === 'wholesaler').length,
        sellers: users.filter(u => u.role === 'seller').length,
        pending: users.filter(u => u.role === 'pending').length,
        totalShops: shops.length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue,
        platformCommission: commission,
        totalAds: ads.length,
        pendingAds: ads.filter(a => a.status === 'pending').length,
        approvedAds: ads.filter(a => a.status === 'approved').length,
      };
    },
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const [newUsers, newOrders, newAds] = await Promise.all([
        supabase.from('profiles').select('email, created_at, role').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('id, total_amount, created_at, status').order('created_at', { ascending: false }).limit(5),
        supabase.from('ads').select('headline, created_at, status').order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        newUsers: newUsers.data || [],
        newOrders: newOrders.data || [],
        newAds: newAds.data || []
      };
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-poppins">Admin Panel</h1>
          <p className="text-gray-600 font-poppins">Platform overview and management dashboard</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-poppins">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-3 flex space-x-4 text-xs">
              <span className="text-green-600">W: {stats?.wholesalers || 0}</span>
              <span className="text-blue-600">S: {stats?.sellers || 0}</span>
              <span className="text-yellow-600">P: {stats?.pending || 0}</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-poppins">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-800">Rs. {stats?.platformCommission?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">From Rs. {stats?.totalRevenue?.toLocaleString() || 0} total</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-poppins">Active Shops</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalShops || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats?.activeProducts || 0} active products</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-poppins">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-700" />
              </div>
            </div>
            <div className="mt-1 flex space-x-3 text-xs">
              <span className="text-green-600">✓ {stats?.completedOrders || 0}</span>
              <span className="text-yellow-600">⏳ {stats?.pendingOrders || 0}</span>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppins flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent User Registrations
            </h3>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity?.newUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 font-poppins">{user.email}</p>
                      <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={
                      user.role === 'wholesaler' ? 'success' : 
                      user.role === 'seller' ? 'info' : 'pending'
                    }>
                      {user.role}
                    </Badge>
                  </div>
                )) || <p className="text-gray-500 text-center py-4">No recent registrations</p>}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppins flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Pending Approvals
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800 font-poppins">Pending Ads</p>
                    <p className="text-xs text-gray-600">Require approval</p>
                  </div>
                </div>
                <Badge variant="warning">{stats?.pendingAds || 0}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800 font-poppins">Approved Ads</p>
                    <p className="text-xs text-gray-600">Currently active</p>
                  </div>
                </div>
                <Badge variant="success">{stats?.approvedAds || 0}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppins">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-800 font-poppins">Review Ads</h4>
              <p className="text-sm text-gray-600">Approve pending advertisements</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-800 font-poppins">Manage Users</h4>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-800 font-poppins">Analytics</h4>
              <p className="text-sm text-gray-600">View detailed platform analytics</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const AdminPanelWithAuth = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
);

export default AdminPanelWithAuth;
