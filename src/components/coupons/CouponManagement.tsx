
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Copy, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  TrendingUp,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getWholesalerCoupons, 
  createCoupon, 
  updateCouponStatus,
  getCouponUsageStats,
  type Coupon 
} from '@/lib/coupons';
import { supabase } from '@/integrations/supabase/client';

const CouponManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['wholesaler-coupons'],
    queryFn: getWholesalerCoupons,
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-coupons'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Coupon created",
        description: "Your coupon has been created successfully.",
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

  const toggleStatusMutation = useMutation({
    mutationFn: ({ couponId, isActive }: { couponId: string; isActive: boolean }) =>
      updateCouponStatus(couponId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-coupons'] });
      toast({
        title: "Coupon updated",
        description: "Coupon status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-coupons'] });
      toast({
        title: "Coupon deleted",
        description: "Coupon has been deleted successfully.",
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

  const handleCreateCoupon = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const couponData = {
      code: (formData.get('code') as string).toUpperCase(),
      discount_type: formData.get('discount_type') as 'percentage' | 'fixed',
      discount_value: parseFloat(formData.get('discount_value') as string),
      usage_limit: formData.get('usage_limit') ? parseInt(formData.get('usage_limit') as string) : undefined,
      min_order_amount: formData.get('min_order_amount') ? parseFloat(formData.get('min_order_amount') as string) : undefined,
      valid_from: formData.get('valid_from') as string,
      valid_until: formData.get('valid_until') as string,
      is_active: true,
      wholesaler_id: '', // This will be set by the function
    };

    createMutation.mutate(couponData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard",
    });
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    return coupon.discount_type === 'percentage' 
      ? `${coupon.discount_value}%` 
      : `Rs. ${coupon.discount_value}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-poppins">Coupon Management</CardTitle>
              <p className="text-sm text-muted-foreground font-poppins">
                Create and manage discount coupons for your customers
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-poppins">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-poppins">Create New Coupon</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="font-poppins">Coupon Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., SAVE20"
                      required
                      className="font-poppins uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_type" className="font-poppins">Discount Type</Label>
                    <Select name="discount_type" required>
                      <SelectTrigger className="font-poppins">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value" className="font-poppins">Discount Value</Label>
                    <Input
                      id="discount_value"
                      name="discount_value"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 20 or 500"
                      required
                      className="font-poppins"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valid_from" className="font-poppins">Valid From</Label>
                      <Input
                        id="valid_from"
                        name="valid_from"
                        type="datetime-local"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid_until" className="font-poppins">Valid Until</Label>
                      <Input
                        id="valid_until"
                        name="valid_until"
                        type="datetime-local"
                        required
                        className="font-poppins"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage_limit" className="font-poppins">Usage Limit (Optional)</Label>
                    <Input
                      id="usage_limit"
                      name="usage_limit"
                      type="number"
                      min="1"
                      placeholder="Leave empty for unlimited"
                      className="font-poppins"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount" className="font-poppins">Minimum Order Amount (Optional)</Label>
                    <Input
                      id="min_order_amount"
                      name="min_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 1000"
                      className="font-poppins"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-poppins"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-20 rounded"></div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-poppins">No coupons created yet</p>
              <p className="text-sm text-muted-foreground/70 font-poppins">Create your first coupon to start offering discounts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="bg-muted px-3 py-1 rounded font-mono text-lg font-bold">
                            {coupon.code}
                          </code>
                          <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {formatDiscount(coupon)} OFF
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Used</p>
                            <p>{coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</p>
                          </div>
                          <div>
                            <p className="font-medium">Valid Until</p>
                            <p>{new Date(coupon.valid_until).toLocaleDateString()}</p>
                          </div>
                          {coupon.min_order_amount && (
                            <div>
                              <p className="font-medium">Min. Order</p>
                              <p>Rs. {coupon.min_order_amount}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => 
                            toggleStatusMutation.mutate({
                              couponId: coupon.id,
                              isActive: !coupon.is_active
                            })
                          }
                          disabled={toggleStatusMutation.isPending}
                        >
                          {coupon.is_active ? 
                            <ToggleRight className="h-4 w-4 text-green-600" /> : 
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          }
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={deleteCouponMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
