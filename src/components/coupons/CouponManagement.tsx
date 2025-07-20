
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Users, ShoppingCart, Percent, Trash2, Edit } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

const CouponManagement: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
  });

  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['wholesaler-coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: any) => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('coupons')
        .insert({
          ...couponData,
          wholesaler_id: user.id,
          used_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-coupons'] });
      setShowCreateDialog(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: '',
      });
      toast({
        title: "Success",
        description: "Coupon created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', couponId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-coupons'] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discount_value || !formData.valid_from || !formData.valid_until) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_until: new Date(formData.valid_until).toISOString(),
    };

    createCouponMutation.mutate(couponData);
  };

  const handleDelete = (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (!coupon.is_active) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    
    if (now < validFrom) {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
    
    if (now > validUntil) {
      return <Badge variant="outline">Expired</Badge>;
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <Badge variant="outline">Used Up</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const activeCoupons = coupons.filter(c => c.is_active);
  const totalUsage = activeCoupons.reduce((sum, coupon) => sum + coupon.used_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Coupon Management</h1>
          <p className="text-gray-600 font-poppins">Create and manage discount coupons for your customers</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="font-poppins">Create New Coupon</DialogTitle>
                <DialogDescription className="font-poppins">
                  Set up a discount coupon for your customers
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="code" className="font-poppins">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="SUMMER20"
                    className="font-poppins uppercase"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Discount Type *</Label>
                    <Select 
                      value={formData.discount_type} 
                      onValueChange={(value: 'percentage' | 'fixed') => 
                        setFormData(prev => ({ ...prev, discount_type: value }))
                      }
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage" className="font-poppins">Percentage</SelectItem>
                        <SelectItem value="fixed" className="font-poppins">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="discount_value" className="font-poppins">
                      Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₨)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                      placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                      className="font-poppins"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_order_amount" className="font-poppins">Min Order Amount (₨)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                      placeholder="1000"
                      className="font-poppins"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="usage_limit" className="font-poppins">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                      placeholder="100"
                      className="font-poppins"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from" className="font-poppins">Valid From *</Label>
                    <Input
                      id="valid_from"
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                      className="font-poppins"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valid_until" className="font-poppins">Valid Until *</Label>
                    <Input
                      id="valid_until"
                      type="datetime-local"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="font-poppins"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="font-poppins">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
                  disabled={createCouponMutation.isPending}
                >
                  {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-8 w-8 text-pakistani_green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Active Coupons</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{activeCoupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Avg. Usage Rate</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">
                  {activeCoupons.length > 0 ? `${(totalUsage / activeCoupons.length).toFixed(1)}` : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Your Coupons</CardTitle>
          <CardDescription className="font-poppins">
            Manage your discount coupons and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-poppins">Loading coupons...</p>
              </div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-poppins mb-2">No coupons yet</h3>
              <p className="text-gray-600 font-poppins mb-4">
                Create your first coupon to offer discounts to your customers.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Coupon
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 font-poppins font-mono">
                            {coupon.code}
                          </h3>
                          {getStatusBadge(coupon)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600 font-poppins">Discount</p>
                            <p className="text-lg font-semibold text-gray-900 font-poppins">
                              {coupon.discount_type === 'percentage' 
                                ? `${coupon.discount_value}%` 
                                : `₨${coupon.discount_value}`
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-poppins">Used</p>
                            <p className="text-lg font-semibold text-gray-900 font-poppins">
                              {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-poppins">Min Order</p>
                            <p className="text-lg font-semibold text-gray-900 font-poppins">
                              {coupon.min_order_amount ? `₨${coupon.min_order_amount}` : 'None'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-poppins">Valid From</p>
                            <p className="text-lg font-semibold text-gray-900 font-poppins">
                              {format(new Date(coupon.valid_from), 'MMM dd')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-poppins">Expires</p>
                            <p className="text-lg font-semibold text-gray-900 font-poppins">
                              {format(new Date(coupon.valid_until), 'MMM dd')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" className="font-poppins">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(coupon.id)}
                          className="font-poppins text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteCouponMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponManagement;
