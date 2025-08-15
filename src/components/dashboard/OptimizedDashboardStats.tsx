
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { queryOptimizer } from '@/lib/performance/query-optimizer-enhanced';
import OptimizedLoader from '@/components/ui/OptimizedLoader';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, Eye } from 'lucide-react';

const OptimizedDashboardStats: React.FC = () => {
  const { profile } = useAuth();

  const { data: stats, isLoading, error } = useOptimizedQuery({
    queryKey: `dashboard_stats_${profile?.id}_${profile?.role}`,
    queryFn: async () => {
      if (!profile) return null;

      const promises = [];

      if (profile.role === 'wholesaler') {
        promises.push(
          queryOptimizer.getOptimizedProducts(undefined, { 
            is_active: true,
            verification_status: 'approved'
          }),
          queryOptimizer.getOptimizedOrders(profile.id, 'wholesaler')
        );
      } else if (profile.role === 'seller') {
        promises.push(
          queryOptimizer.getOptimizedOrders(profile.id, 'seller'),
          queryOptimizer.getOptimizedShops({ isActive: true })
        );
      } else if (profile.role === 'admin') {
        promises.push(
          queryOptimizer.optimizedQuery('profiles', {
            select: 'id, role',
            config: { enableCaching: true }
          }),
          queryOptimizer.optimizedQuery('orders', {
            select: 'id, status, total_amount',
            config: { enableCaching: true }
          })
        );
      }

      const results = await Promise.all(promises);
      return results;
    },
    enabled: !!profile,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  if (isLoading) {
    return <OptimizedLoader type="dashboard" count={4} />;
  }

  if (error || !stats || !profile) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Unable to load dashboard statistics
        </div>
      </Card>
    );
  }

  const getStatsForRole = () => {
    if (profile.role === 'wholesaler') {
      const [products = [], orders = []] = stats;
      const totalRevenue = orders.reduce((sum: number, order: any) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );
      const activeOrders = orders.filter((order: any) => 
        order.status === 'pending' || order.status === 'confirmed'
      ).length;

      return [
        {
          title: 'Total Products',
          value: products.length.toString(),
          change: '+12%',
          icon: Package,
          color: 'text-blue-600'
        },
        {
          title: 'Active Orders',
          value: activeOrders.toString(),
          change: `+${Math.round((activeOrders / orders.length) * 100) || 0}%`,
          icon: ShoppingCart,
          color: 'text-green-600'
        },
        {
          title: 'Total Revenue',
          value: `PKR ${totalRevenue.toLocaleString()}`,
          change: '+8%',
          icon: DollarSign,
          color: 'text-yellow-600'
        },
        {
          title: 'Product Views',
          value: '1,234',
          change: '+15%',
          icon: Eye,
          color: 'text-purple-600'
        }
      ];
    } else if (profile.role === 'seller') {
      const [orders = [], shops = []] = stats;
      const totalSpent = orders.reduce((sum: number, order: any) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );
      const pendingOrders = orders.filter((order: any) => 
        order.status === 'pending'
      ).length;

      return [
        {
          title: 'Orders Placed',
          value: orders.length.toString(),
          change: '+5%',
          icon: ShoppingCart,
          color: 'text-blue-600'
        },
        {
          title: 'Pending Orders',
          value: pendingOrders.toString(),
          change: `${pendingOrders > 0 ? '+' : ''}${pendingOrders}`,
          icon: TrendingUp,
          color: 'text-orange-600'
        },
        {
          title: 'Total Spent',
          value: `PKR ${totalSpent.toLocaleString()}`,
          change: '+3%',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          title: 'Available Shops',
          value: shops.length.toString(),
          change: '+2%',
          icon: Users,
          color: 'text-pink-600'
        }
      ];
    } else if (profile.role === 'admin') {
      const [profiles = [], orders = []] = stats;
      const totalRevenue = orders.reduce((sum: number, order: any) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );
      const activeOrders = orders.filter((order: any) => 
        order.status !== 'completed' && order.status !== 'rejected'
      ).length;

      return [
        {
          title: 'Total Users',
          value: profiles.length.toString(),
          change: '+7%',
          icon: Users,
          color: 'text-blue-600'
        },
        {
          title: 'Active Orders',
          value: activeOrders.toString(),
          change: '+4%',
          icon: ShoppingCart,
          color: 'text-green-600'
        },
        {
          title: 'Platform Revenue',
          value: `PKR ${totalRevenue.toLocaleString()}`,
          change: '+11%',
          icon: DollarSign,
          color: 'text-purple-600'
        },
        {
          title: 'Growth Rate',
          value: '8.5%',
          change: '+1.2%',
          icon: TrendingUp,
          color: 'text-orange-600'
        }
      ];
    }
    return [];
  };

  const dashboardStats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-poppins">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-poppins">{stat.value}</div>
              <p className="text-xs text-muted-foreground font-poppins">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OptimizedDashboardStats;
