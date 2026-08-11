import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  total_users: number;
  total_wholesalers: number;
  total_sellers: number;
  total_pending_approvals: number;
  total_shops: number;
  total_products: number;
  total_orders: number;
}

interface WholesalerStats {
  shops_count: number;
  products_count: number;
  active_products: number;
  pending_products: number;
  total_orders: number;
  verification_status: string;
}

const Stats: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [wholesalerStats, setWholesalerStats] = useState<WholesalerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      if (profile.role === 'admin') {
        await fetchPlatformStats();
      } else if (profile.role === 'wholesaler') {
        await fetchWholesalerStats();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      // Fetch all stats manually since platform_stats table doesn't exist in types
      const [
        { data: users },
        { data: wholesalers }, 
        { data: sellers },
        { data: pendingRoles },
        { data: shops },
        { data: products },
        { data: orders }
      ] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('profiles').select('id').eq('role', 'wholesaler'),
        supabase.from('profiles').select('id').eq('role', 'seller'),
        supabase.from('role_requests').select('id').eq('status', 'pending'),
        supabase.from('shops').select('id'),
        supabase.from('products').select('id'),
        supabase.from('orders').select('id')
      ]);

      const stats: PlatformStats = {
        total_users: users?.length || 0,
        total_wholesalers: wholesalers?.length || 0,
        total_sellers: sellers?.length || 0,
        total_pending_approvals: pendingRoles?.length || 0,
        total_shops: shops?.length || 0,
        total_products: products?.length || 0,
        total_orders: orders?.length || 0
      };

      setPlatformStats(stats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  const fetchWholesalerStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch shops count
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (shopsError) throw shopsError;

      const shopIds = shops?.map(shop => shop.id) || [];

      // Fetch products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('is_active, verification_status')
        .in('shop_id', shopIds);

      if (productsError) throw productsError;

      // Fetch orders stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .in('shop_id', shopIds);

      if (ordersError) throw ordersError;

      // Calculate stats
      const stats: WholesalerStats = {
        shops_count: shops?.length || 0,
        products_count: products?.length || 0,
        active_products: products?.filter(p => p.is_active && p.verification_status === 'approved').length || 0,
        pending_products: products?.filter(p => p.verification_status === 'pending').length || 0,
        total_orders: orders?.length || 0,
        verification_status: 'pending' // This would come from a business verification table
      };

      setWholesalerStats(stats);
    } catch (error) {
      console.error('Error fetching wholesaler stats:', error);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    description?: string; 
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-poppins">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-poppins">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground font-poppins">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-poppins">{t('statistics')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-2"></div>
                  <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-poppins">{t('statistics_dashboard')}</h1>
          <Badge variant="outline" className="font-poppins">
            {profile?.role === 'admin' ? t('platform_overview') : t('business_metrics')}
          </Badge>
        </div>

        {profile?.role === 'admin' && platformStats && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
              <TabsTrigger value="users">{t('users')}</TabsTrigger>
              <TabsTrigger value="business">{t('business')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title={t('total_users')}
                  value={platformStats.total_users}
                  icon={Users}
                  description={t('registered_users')}
                />
                <StatCard
                  title={t('wholesaler')}
                  value={platformStats.total_wholesalers}
                  icon={Store}
                  description={t('active_wholesalers')}
                />
                <StatCard
                  title={t('sellers')}
                  value={platformStats.total_sellers}
                  icon={ShoppingCart}
                  description={t('active_sellers')}
                />
                <StatCard
                  title={t('pending')}
                  value={platformStats.total_pending_approvals}
                  icon={Clock}
                  description={t('awaiting_approval')}
                />
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title={t('total_users')}
                  value={platformStats.total_users}
                  icon={Users}
                  description={t('all_registered_users')}
                />
                <StatCard
                  title={t('business_accounts')}
                  value={platformStats.total_wholesalers}
                  icon={Store}
                  description={t('wholesaler_accounts')}
                />
                <StatCard
                  title={t('buyer_accounts')}
                  value={platformStats.total_sellers}
                  icon={ShoppingCart}
                  description={t('seller_accounts')}
                />
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title={t('shops')}
                  value={platformStats.total_shops}
                  icon={Store}
                  description={t('active_shops')}
                />
                <StatCard
                  title={t('total_products')}
                  value={platformStats.total_products}
                  icon={Package}
                  description={t('listed_products')}
                />
                <StatCard
                  title={t('orders')}
                  value={platformStats.total_orders}
                  icon={DollarSign}
                  description={t('processed_orders')}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {profile?.role === 'wholesaler' && wholesalerStats && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
              <TabsTrigger value="products">{t('products')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title={t('shops')}
                  value={wholesalerStats.shops_count}
                  icon={Store}
                  description={t('active_shops')}
                />
                <StatCard
                  title={t('total_products')}
                  value={wholesalerStats.products_count}
                  icon={Package}
                  description={t('listed_products')}
                />
                <StatCard
                  title={t('orders')}
                  value={wholesalerStats.total_orders}
                  icon={ShoppingCart}
                  description={t('received_orders')}
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title={t('total_products')}
                  value={wholesalerStats.active_products}
                  icon={CheckCircle}
                  description={t('live_and_approved')}
                />
                <StatCard
                  title={t('pending')}
                  value={wholesalerStats.pending_products}
                  icon={Clock}
                  description={t('awaiting_review')}
                />
                <StatCard
                  title={t('total_products')}
                  value={wholesalerStats.products_count}
                  icon={Package}
                  description={t('all_products')}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {profile?.role === 'seller' && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold font-poppins mb-2">
              {t('analytics')} - {t('seller')}
            </h2>
            <p className="text-muted-foreground font-poppins">
              {t('track_orders')}, {t('favorite_shops')}, {t('track_purchases')}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const StatsWithAuth = () => (
  <ProtectedRoute>
    <Stats />
  </ProtectedRoute>
);

export default StatsWithAuth;
