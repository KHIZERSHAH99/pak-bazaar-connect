
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateCouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponCreated: () => void;
}

const CreateCouponDialog: React.FC<CreateCouponDialogProps> = ({
  isOpen,
  onClose,
  onCouponCreated
}) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const generateCouponCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('coupons')
        .insert({
          wholesaler_id: user.id,
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          valid_from: new Date(formData.valid_from).toISOString(),
          valid_until: new Date(formData.valid_until).toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Coupon Created!",
        description: `Coupon ${formData.code} has been created successfully.`,
      });

      // Reset form
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: ''
      });

      onCouponCreated();
    } catch (error: any) {
      toast({
        title: "Failed to Create Coupon",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Coupon Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="SAVE10"
                className="flex-1"
                required
              />
              <Button type="button" onClick={generateCouponCode} variant="outline">
                Generate
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="discount_type">Discount Type</Label>
            <Select
              value={formData.discount_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discount_value">
              Discount Value ({formData.discount_type === 'percentage' ? '%' : 'Rs.'})
            </Label>
            <Input
              id="discount_value"
              type="number"
              value={formData.discount_value}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
              placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
              required
            />
          </div>

          <div>
            <Label htmlFor="min_order_amount">Minimum Order Amount (Rs.)</Label>
            <Input
              id="min_order_amount"
              type="number"
              value={formData.min_order_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
              placeholder="1000"
            />
          </div>

          <div>
            <Label htmlFor="usage_limit">Usage Limit</Label>
            <Input
              id="usage_limit"
              type="number"
              value={formData.usage_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
              placeholder="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCouponDialog;
