
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatsForRole = () => {
    if (profile?.role === 'wholesaler') {
      return [
        {
          title: 'Total Products',
          value: '0',
          change: '+0%',
          icon: ShoppingCart,
          color: 'text-blue-600'
        },
        {
          title: 'Active Orders',
          value: '0',
          change: '+0%',
          icon: TrendingUp,
          color: 'text-green-600'
        },
        {
          title: 'Total Revenue',
          value: 'PKR 0',
          change: '+0%',
          icon: DollarSign,
          color: 'text-yellow-600'
        },
        {
          title: 'Customers',
          value: '0',
          change: '+0%',
          icon: Users,
          color: 'text-purple-600'
        }
      ];
    } else if (profile?.role === 'seller') {
      return [
        {
          title: 'Orders Placed',
          value: '0',
          change: '+0%',
          icon: ShoppingCart,
          color: 'text-blue-600'
        },
        {
          title: 'Pending Orders',
          value: '0',
          change: '+0%',
          icon: TrendingUp,
          color: 'text-orange-600'
        },
        {
          title: 'Total Spent',
          value: 'PKR 0',
          change: '+0%',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          title: 'Favorite Shops',
          value: '0',
          change: '+0%',
          icon: Users,
          color: 'text-pink-600'
        }
      ];
    } else if (profile?.role === 'admin') {
      return [
        {
          title: 'Total Users',
          value: '0',
          change: '+0%',
          icon: Users,
          color: 'text-blue-600'
        },
        {
          title: 'Active Orders',
          value: '0',
          change: '+0%',
          icon: ShoppingCart,
          color: 'text-green-600'
        },
        {
          title: 'Platform Revenue',
          value: 'PKR 0',
          change: '+0%',
          icon: DollarSign,
          color: 'text-purple-600'
        },
        {
          title: 'Growth Rate',
          value: '0%',
          change: '+0%',
          icon: TrendingUp,
          color: 'text-orange-600'
        }
      ];
    }
    return [];
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
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

export default DashboardStats;
