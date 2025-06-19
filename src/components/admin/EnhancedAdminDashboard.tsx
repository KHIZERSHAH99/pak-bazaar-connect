
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  X, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const EnhancedAdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [
        rolesResponse,
        verificationResponse,
        ordersResponse,
        commissionsResponse
      ] = await Promise.all([
        supabase.from('role_requests').select('*, profiles(email, business_name)').eq('status', 'pending'),
        supabase.from('profiles').select('*').eq('verification_status', 'pending').eq('role', 'wholesaler'),
        supabase.from('orders').select('*, shops(name), profiles(email)').order('created_at', { ascending: false }).limit(10),
        supabase.from('commission_records').select('*').eq('status', 'pending').limit(10)
      ]);

      return {
        pendingRoles: rolesResponse.data || [],
        pendingVerifications: verificationResponse.data || [],
        recentOrders: ordersResponse.data || [],
        pendingCommissions: commissionsResponse.data || []
      };
    },
    refetchInterval: 30000,
  });

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        totalUsers,
        totalOrders,
        totalCommission,
        activeShops
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('commission_records').select('commission_amount').eq('status', 'pending'),
        supabase.from('shops').select('id', { count: 'exact' })
      ]);

      const pendingCommissionTotal = totalCommission.data?.reduce((sum, record) => sum + Number(record.commission_amount), 0) || 0;

      return {
        totalUsers: totalUsers.count || 0,
        totalOrders: totalOrders.count || 0,
        pendingCommissionAmount: pendingCommissionTotal,
        activeShops: activeShops.count || 0
      };
    },
  });

  // Approve role request
  const approveRoleMutation = useMutation({
    mutationFn: async ({ requestId, userId, newRole }: { requestId: string; userId: string; newRole: string }) => {
      // Update role request status
      await supabase
        .from('role_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      // Update user profile
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast({
        title: "Role Approved",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to approve role request.",
        variant: "destructive",
      });
    },
  });

  // Reject role request
  const rejectRoleMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await supabase
        .from('role_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast({
        title: "Role Rejected",
        description: "Role request has been rejected.",
      });
    },
  });

  // Approve verification
  const approveVerificationMutation = useMutation({
    mutationFn: async (userId: string) => {
      await supabase
        .from('profiles')
        .update({ verification_status: 'approved' })
        .eq('id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast({
        title: "Verification Approved",
        description: "Wholesaler verification has been approved.",
      });
    },
  });

  // Reject verification
  const rejectVerificationMutation = useMutation({
    mutationFn: async ({ userId, notes }: { userId: string; notes?: string }) => {
      await supabase
        .from('profiles')
        .update({ 
          verification_status: 'rejected',
          verification_notes: notes 
        })
        .eq('id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast({
        title: "Verification Rejected",
        description: "Wholesaler verification has been rejected.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">Rs. {stats?.pendingCommissionAmount?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600">Pending Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.activeShops || 0}</p>
                <p className="text-sm text-gray-600">Active Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage role requests, verifications, and platform operations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">
                Role Requests ({dashboardData?.pendingRoles.length || 0})
              </TabsTrigger>
              <TabsTrigger value="verifications">
                Verifications ({dashboardData?.pendingVerifications.length || 0})
              </TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Pending Role Requests</span>
                        <Badge variant="secondary">{dashboardData?.pendingRoles.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending Verifications</span>
                        <Badge variant="secondary">{dashboardData?.pendingVerifications.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Recent Orders</span>
                        <Badge variant="secondary">{dashboardData?.recentOrders.length || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-6">
              {dashboardData?.pendingRoles.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending role requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.pendingRoles.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{request.profiles?.email}</h3>
                            <p className="text-sm text-gray-600">
                              Business: {request.profiles?.business_name || 'Not provided'}
                            </p>
                            <Badge variant="outline">
                              Requesting: {request.requested_role}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveRoleMutation.mutate({
                                requestId: request.id,
                                userId: request.user_id,
                                newRole: request.requested_role
                              })}
                              disabled={approveRoleMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectRoleMutation.mutate(request.id)}
                              disabled={rejectRoleMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verifications" className="space-y-4 mt-6">
              {dashboardData?.pendingVerifications.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.pendingVerifications.map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{profile.email}</h3>
                            <p className="text-sm text-gray-600">
                              Business: {profile.business_name || 'Not provided'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone: {profile.phone_number || 'Not provided'}
                            </p>
                            {profile.cnic_image && profile.selfie_image && (
                              <Badge variant="outline" className="text-green-600">
                                Documents Uploaded
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open documents in new tabs for review
                                if (profile.cnic_image) {
                                  window.open(`${supabase.supabaseUrl}/storage/v1/object/public/verification-documents/${profile.cnic_image}`, '_blank');
                                }
                                if (profile.selfie_image) {
                                  window.open(`${supabase.supabaseUrl}/storage/v1/object/public/verification-documents/${profile.selfie_image}`, '_blank');
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Docs
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveVerificationMutation.mutate(profile.id)}
                              disabled={approveVerificationMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectVerificationMutation.mutate({ userId: profile.id, notes: 'Documents unclear' })}
                              disabled={rejectVerificationMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 mt-6">
              {dashboardData?.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.recentOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-600">
                              Shop: {order.shops?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Buyer: {order.profiles?.email || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: Rs. {order.total_amount?.toLocaleString()}
                            </p>
                            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
