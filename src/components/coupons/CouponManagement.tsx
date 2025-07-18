
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Ticket, Calendar, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateCouponDialog from './CreateCouponDialog';

const CouponManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['wholesaler-coupons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000
  });

  const handleCouponCreated = () => {
    refetch();
    setIsCreateDialogOpen(false);
  };

  const getStatusBadge = (coupon: any) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const activeCoupons = coupons.filter(c => {
    const now = new Date();
    const validFrom = new Date(c.valid_from);
    const validUntil = new Date(c.valid_until);
    return c.is_active && now >= validFrom && now <= validUntil;
  });

  const expiredCoupons = coupons.filter(c => {
    const now = new Date();
    const validUntil = new Date(c.valid_until);
    return now > validUntil;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Coupon Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-poppins">Coupon Management</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{activeCoupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold">
                  {coupons.reduce((sum, coupon) => sum + (coupon.used_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Discount</p>
                <p className="text-2xl font-bold">
                  {coupons.length > 0 
                    ? Math.round(coupons.reduce((sum, c) => sum + c.discount_value, 0) / coupons.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {coupons.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No coupons created yet.</p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-4 bg-pakistani_green-700 hover:bg-pakistani_green-800"
                  >
                    Create Your First Coupon
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{coupon.code}</h3>
                          {getStatusBadge(coupon)}
                        </div>
                        <p className="text-gray-600">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `Rs. ${coupon.discount_value} off`}
                          {coupon.min_order_amount && ` (Min. order Rs. ${coupon.min_order_amount})`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Valid: {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          Used: {coupon.used_count || 0}
                          {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {activeCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active coupons.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg border-green-200 bg-green-50">
                      <div>
                        <h3 className="font-semibold text-lg">{coupon.code}</h3>
                        <p className="text-gray-600">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `Rs. ${coupon.discount_value} off`}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Expired Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {expiredCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No expired coupons.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiredCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                      <div>
                        <h3 className="font-semibold text-lg">{coupon.code}</h3>
                        <p className="text-gray-600">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `Rs. ${coupon.discount_value} off`}
                        </p>
                      </div>
                      <Badge variant="destructive">Expired</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateCouponDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCouponCreated={handleCouponCreated}
      />
    </div>
  );
};

export default CouponManagement;
