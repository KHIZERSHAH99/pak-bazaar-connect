
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Package, Store, ShoppingCart } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendDirection 
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-poppins">{title}</p>
        <p className="text-2xl font-bold font-poppins">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className={`h-3 w-3 ${
              trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
            }`} />
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        {icon}
      </div>
    </div>
  </Card>
);

const DashboardStats: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role === 'wholesaler') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Products"
          value="24"
          icon={<Package className="h-5 w-5 text-primary" />}
          trend="+2 this week"
          trendDirection="up"
        />
        <StatsCard
          title="Active Shops"
          value="3"
          icon={<Store className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Orders Today"
          value="8"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          trend="+3 from yesterday"
          trendDirection="up"
        />
        <StatsCard
          title="Revenue (PKR)"
          value="45,600"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend="+12% this month"
          trendDirection="up"
        />
      </div>
    );
  } else if (profile?.role === 'seller') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Orders Placed"
          value="12"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          trend="+2 this month"
          trendDirection="up"
        />
        <StatsCard
          title="Favorite Shops"
          value="7"
          icon={<Store className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Spent (PKR)"
          value="28,400"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend="+8% vs last month"
          trendDirection="up"
        />
      </div>
    );
  }

  return null;
};

export default DashboardStats;
