
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  XCircle,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { 
  getPendingWholesalers, 
  approveWholesaler, 
  getAllUsers,
  getUserProfile 
} from '@/lib/auth-fixed';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  pendingWholesalers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
}

const FixedAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingWholesalers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [pendingWholesalers, setPendingWholesalers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);
    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [usersResult, shopsResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('shops').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' })
      ]);

      // Load pending wholesalers
      const pendingWholesalersData = await getPendingWholesalers();
      const allUsersData = await getAllUsers();

      // Load pending ads
      const { data: adsData } = await supabase
        .from('ads')
        .select(`
          *,
          profiles!ads_wholesaler_id_fkey(contact_name, business_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setStats({
        totalUsers: usersResult.count || 0,
        pendingWholesalers: pendingWholesalersData.length,
        totalShops: shopsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0
      });

      setPendingWholesalers(pendingWholesalersData);
      setAllUsers(allUsersData);
      setPendingAds(adsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWholesaler = async (userId: string) => {
    try {
      const result = await approveWholesaler(userId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Wholesaler approved successfully"
        });
        loadDashboardData();
      } else {
        throw new Error('Approval failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve wholesaler",
        variant: "destructive"
      });
    }
  };

  const handleApproveAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'approved' })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ad approved successfully"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve ad",
        variant: "destructive"
      });
    }
  };

  const handleRejectAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ad rejected successfully"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject ad",
        variant: "destructive"
      });
    }
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Administrator
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingWholesalers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="wholesalers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wholesalers">Pending Wholesalers</TabsTrigger>
          <TabsTrigger value="ads">Pending Ads</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="wholesalers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Wholesaler Approvals</CardTitle>
              <CardDescription>
                Review and approve new wholesaler registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingWholesalers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending wholesaler approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingWholesalers.map((wholesaler) => (
                    <div key={wholesaler.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{wholesaler.business_name || 'N/A'}</h3>
                          <p className="text-sm text-gray-600">{wholesaler.contact_name}</p>
                          <p className="text-sm text-gray-500">{wholesaler.email}</p>
                          <p className="text-sm text-gray-500">{wholesaler.phone_number || 'No phone'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveWholesaler(wholesaler.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Ad Approvals</CardTitle>
              <CardDescription>
                Review and approve new advertisements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAds.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending ad approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingAds.map((ad) => (
                    <div key={ad.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{ad.headline}</h3>
                          <p className="text-sm text-gray-600">
                            By: {ad.profiles?.business_name || ad.profiles?.contact_name || 'Unknown'}
                          </p>
                          {ad.image && (
                            <img 
                              src={ad.image} 
                              alt={ad.headline}
                              className="mt-2 w-32 h-20 object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveAd(ad.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectAd(ad.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{user.business_name || user.contact_name || 'N/A'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'wholesaler' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.verification_status === 'approved' ? 'default' : 'secondary'}>
                            {user.verification_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FixedAdminDashboard;
