import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, BarChart3, Shield, Store, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard: React.FC = () => {
  const { data: adminStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const [
        usersRes,
        shopsRes,
        ordersRes,
        pendingAdsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'admin'),
        supabase.from('shops').select('id', { count: 'exact' }), // Assuming all shops are active
        supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
        supabase.from('ads').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const totalRevenue = (ordersRes.data || [])
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total_amount), 0);
      
      const platformCommission = totalRevenue * 0.025; // 2.5% platform commission

      return {
        totalUsers: usersRes.count || 0,
        activeShops: shopsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        platformRevenue: platformCommission,
        pendingAds: pendingAdsRes.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const quickStats = adminStats || {
    totalUsers: 0,
    pendingAds: 0,
    activeShops: 0,
    totalOrders: 0,
    platformRevenue: 0,
  };
  
  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; colorClass: string; isLoading: boolean }> = 
  ({ title, value, icon: Icon, colorClass, isLoading }) => (
    <Card className={`p-4 ${colorClass}-50 dark:bg-${colorClass}-900/20 border-${colorClass}-200 dark:border-${colorClass}-800`}>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm text-${colorClass}-700 dark:text-${colorClass}-300 font-poppins`}>{title}</p>
            <p className={`text-2xl font-bold text-${colorClass}-800 dark:text-${colorClass}-200`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${colorClass}-600 dark:text-${colorClass}-400`} />
        </div>
      )}
    </Card>
  );


  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 font-poppins">
        Admin Dashboard
      </h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={quickStats.totalUsers} icon={Users} colorClass="blue" isLoading={isLoadingStats} />
        <StatCard title="Active Shops" value={quickStats.activeShops} icon={Store} colorClass="green" isLoading={isLoadingStats} />
        <StatCard title="Total Orders" value={quickStats.totalOrders} icon={Package} colorClass="purple" isLoading={isLoadingStats} />
        <StatCard title="Platform Revenue" value={`Rs. ${quickStats.platformRevenue.toLocaleString()}`} icon={DollarSign} colorClass="orange" isLoading={isLoadingStats} />
      </div>

      {/* Pending Actions Alert */}
      {quickStats.pendingAds > 0 && !isLoadingStats && (
        <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-300" /> {/* Changed icon */}
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 font-poppins">
                  Pending Ad Approvals
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-poppins">
                  There are {quickStats.pendingAds} ad{quickStats.pendingAds !== 1 ? 's' : ''} requiring approval.
                </p>
              </div>
            </div>
            <Link to="/dashboard/ad-approvals">
              <Badge variant="warning">{quickStats.pendingAds}</Badge>
            </Link>
          </div>
        </Card>
      )}
      
      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/admin" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-blue-500">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <BarChart3 className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Admin Panel</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Comprehensive platform overview and management tools.
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/ad-approvals" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-purple-500">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Ad Approvals</h3>
                  {quickStats.pendingAds > 0 && !isLoadingStats && (
                    <Badge variant="destructive">{quickStats.pendingAds}</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Review and approve advertisement submissions from wholesalers.
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/chat" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-green-500">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Support Chat</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Access the AI chat support to help users with questions.
            </p>
          </Card>
        </Link>

        <Card className="p-4 md:p-6 bg-pakistani_green-50 dark:bg-pakistani_green-900/20 border-pakistani_green-200 dark:border-pakistani_green-700">
          <div className="flex items-center mb-4">
            <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-pakistani_green-700 dark:text-pakistani_green-300" />
            </div>
            <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800 dark:text-pakistani_green-200">
              User Management
            </h3>
          </div>
          <p className="text-pakistani_green-700 dark:text-pakistani_green-300 font-poppins text-sm md:text-base">
            Users can now instantly switch roles without approval. Role changes are immediate and automatic.
          </p>
        </Card>

        <Card className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
              <Shield className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold font-poppins text-blue-800 dark:text-blue-200">Platform Security</h3>
          </div>
          <p className="text-blue-700 dark:text-blue-300 font-poppins text-sm md:text-base">
            Monitor platform security, user verification, and fraud prevention.
          </p>
        </Card>

        {/* System Health Card */}
        <Card className="p-4 md:p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold font-poppins text-green-800 dark:text-green-200">System Health</h3>
          </div>
          <p className="text-green-700 dark:text-green-300 font-poppins text-sm md:text-base">
            All systems operational. Performance optimized for peak traffic.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
