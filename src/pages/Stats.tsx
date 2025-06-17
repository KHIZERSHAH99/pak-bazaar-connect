
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  TrendingUp, 
  AlertCircle,
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
  total_ads: number;
  total_shops: number;
  total_products: number;
  total_orders: number;
}

interface WholesalerStats {
  shops_count: number;
  products_count: number;
  active_products: number;
  pending_products: number;
  ads_count: number;
  active_ads: number;
  pending_ads: number;
  total_orders: number;
  verification_status: string;
}

const Stats: React.FC = () => {
  const { profile } = useAuth();
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
      // Call the update function first
      await supabase.rpc('update_platform_stats');

      // Fetch the latest stats
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setPlatformStats(data);
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

      // Fetch ads stats
      const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('status')
        .eq('wholesaler_id', user.id);

      if (adsError) throw adsError;

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
        ads_count: ads?.length || 0,
        active_ads: ads?.filter(a => a.status === 'active').length || 0,
        pending_ads: ads?.filter(a => a.status === 'pending').length || 0,
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
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className={`h-3 w-3 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`} />
            <span className={`text-xs ml-1 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend === 'up' ? 'Growing' : trend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-poppins">Statistics</h1>
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
          <h1 className="text-2xl font-bold font-poppins">Statistics Dashboard</h1>
          <Badge variant="outline" className="font-poppins">
            {profile?.role === 'admin' ? 'Platform Overview' : 'Business Metrics'}
          </Badge>
        </div>

        {profile?.role === 'admin' && platformStats && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={platformStats.total_users}
                  icon={Users}
                  description="Registered users"
                  trend="up"
                />
                <StatCard
                  title="Wholesalers"
                  value={platformStats.total_wholesalers}
                  icon={Store}
                  description="Active wholesalers"
                  trend="up"
                />
                <StatCard
                  title="Sellers"
                  value={platformStats.total_sellers}
                  icon={ShoppingCart}
                  description="Active sellers"
                  trend="up"
                />
                <StatCard
                  title="Pending Approvals"
                  value={platformStats.total_pending_approvals}
                  icon={Clock}
                  description="Awaiting approval"
                  trend="neutral"
                />
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Platform Users"
                  value={platformStats.total_users}
                  icon={Users}
                  description="All registered users"
                />
                <StatCard
                  title="Business Accounts"
                  value={platformStats.total_wholesalers}
                  icon={Store}
                  description="Wholesaler accounts"
                />
                <StatCard
                  title="Buyer Accounts"
                  value={platformStats.total_sellers}
                  icon={ShoppingCart}
                  description="Seller accounts"
                />
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Shops"
                  value={platformStats.total_shops}
                  icon={Store}
                  description="Active shops"
                />
                <StatCard
                  title="Total Products"
                  value={platformStats.total_products}
                  icon={Package}
                  description="Listed products"
                />
                <StatCard
                  title="Total Ads"
                  value={platformStats.total_ads}
                  icon={TrendingUp}
                  description="Created ads"
                />
                <StatCard
                  title="Total Orders"
                  value={platformStats.total_orders}
                  icon={DollarSign}
                  description="Processed orders"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {profile?.role === 'wholesaler' && wholesalerStats && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="My Shops"
                  value={wholesalerStats.shops_count}
                  icon={Store}
                  description="Active shops"
                />
                <StatCard
                  title="Total Products"
                  value={wholesalerStats.products_count}
                  icon={Package}
                  description="Listed products"
                />
                <StatCard
                  title="Active Ads"
                  value={wholesalerStats.active_ads}
                  icon={TrendingUp}
                  description="Running campaigns"
                />
                <StatCard
                  title="Total Orders"
                  value={wholesalerStats.total_orders}
                  icon={ShoppingCart}
                  description="Received orders"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins">Business Status</CardTitle>
                    <CardDescription className="font-poppins">
                      Current verification and account status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-poppins">Account Verification</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-poppins">Business Profile</span>
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins">Quick Actions</CardTitle>
                    <CardDescription className="font-poppins">
                      Recommended next steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-poppins">• Complete business verification</div>
                      <div className="text-sm font-poppins">• Add more products to shops</div>
                      <div className="text-sm font-poppins">• Create promotional ads</div>
                      <div className="text-sm font-poppins">• Optimize product listings</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Active Products"
                  value={wholesalerStats.active_products}
                  icon={CheckCircle}
                  description="Live and approved"
                />
                <StatCard
                  title="Pending Approval"
                  value={wholesalerStats.pending_products}
                  icon={Clock}
                  description="Awaiting review"
                />
                <StatCard
                  title="Total Listed"
                  value={wholesalerStats.products_count}
                  icon={Package}
                  description="All products"
                />
              </div>
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Active Ads"
                  value={wholesalerStats.active_ads}
                  icon={TrendingUp}
                  description="Currently running"
                />
                <StatCard
                  title="Pending Ads"
                  value={wholesalerStats.pending_ads}
                  icon={Clock}
                  description="Awaiting approval"
                />
                <StatCard
                  title="Total Campaigns"
                  value={wholesalerStats.ads_count}
                  icon={AlertCircle}
                  description="All time created"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {profile?.role === 'seller' && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold font-poppins mb-2">Seller Analytics Coming Soon</h2>
            <p className="text-muted-foreground font-poppins">
              Track your orders, favorite suppliers, and purchase history.
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
