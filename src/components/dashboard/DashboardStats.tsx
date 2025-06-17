
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Package, Store, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatsCardProps {
  title: string;
  value: string | number;
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);

    const fetchStats = async () => {
      if (!profile) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStats(null);
          setLoading(false);
          return;
        }

        // Seller
        if (profile.role === 'seller') {
          // Orders placed and total spent
          const { data: orders } = await supabase
            .from('orders')
            .select('id,total_amount,shop_id')
            .eq('buyer_id', user.id);

          // Favorite shops (dummy, per requirements: show 0 if not implemented)
          let favoriteCount = 0;
          // If we add a favorites table, count actual rows

          let orderCount = orders?.length || 0;
          let totalSpent =
            orders?.reduce(
              (acc, curr) => acc + (typeof curr.total_amount === 'number'
                ? curr.total_amount
                : Number(curr.total_amount) || 0),
              0
            ) || 0;

          setStats({
            ordersPlaced: orderCount,
            favoriteShops: favoriteCount,
            spent: totalSpent,
          });
        }

        // Wholesaler
        if (profile.role === 'wholesaler') {
          // Get owned shop IDs
          const { data: shops } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id);

          let activeShops = shops?.length || 0;
          let shopIds = shops?.map((s) => s.id) || [];

          // Total products across shops
          let productCount = 0;
          if (shopIds.length > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('id')
              .in('shop_id', shopIds)
              .eq('is_active', true);
            productCount = products?.length || 0;
          }

          // Orders for all their shops
          let ordersToday = 0;
          let today = new Date();
          today.setHours(0,0,0,0);
          if (shopIds.length > 0) {
            const { data: orders } = await supabase
              .from('orders')
              .select('id, created_at')
              .in('shop_id', shopIds);

            ordersToday =
              orders?.filter(
                (o) =>
                  o.created_at &&
                  new Date(o.created_at).setHours(0,0,0,0) === today.getTime()
              ).length || 0;
          }

          // Dummy revenue, as real revenue needs more computation and demo only
          let revenue = 0;
          if (shopIds.length > 0) {
            const { data: orders } = await supabase
              .from('orders')
              .select('total_amount')
              .in('shop_id', shopIds);

            revenue = orders?.reduce(
              (acc, curr) =>
                acc + (typeof curr.total_amount === 'number'
                  ? curr.total_amount
                  : Number(curr.total_amount) || 0),
              0
            ) || 0;
          }

          setStats({
            products: productCount,
            activeShops,
            ordersToday,
            revenue,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, [profile]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4].map((k) => (
          <Card className="h-28 animate-pulse" key={k}>
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading…</div>
          </Card>
        ))}
      </div>
    );
  }

  if (!profile || !stats) return null;

  if (profile.role === 'wholesaler') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Products"
          value={stats.products}
          icon={<Package className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Active Shops"
          value={stats.activeShops}
          icon={<Store className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Orders Today"
          value={stats.ordersToday}
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Revenue (PKR)"
          value={stats.revenue.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>
    );
  } else if (profile.role === 'seller') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Orders Placed"
          value={stats.ordersPlaced}
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Favorite Shops"
          value={stats.favoriteShops}
          icon={<Store className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Spent (PKR)"
          value={stats.spent.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>
    );
  }
  return null;
};

export default DashboardStats;
