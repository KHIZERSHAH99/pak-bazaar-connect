
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertTriangle, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface SecureOrderFormProps {
  shopId: string;
  shopName: string;
  onOrderCreated?: () => void;
  onClose?: () => void;
}

export const SecureOrderForm: React.FC<SecureOrderFormProps> = ({ 
  shopId, 
  shopName, 
  onOrderCreated,
  onClose 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    totalAmount: '',
    paymentMethod: 'bank_transfer',
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    screenshot: null as File | null,
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 102400) { // 100KB limit
        toast({
          title: "File Too Large",
          description: "Payment screenshot must be less than 100KB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or WebP image.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const uploadScreenshot = async (file: File) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid order amount.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.screenshot) {
      toast({
        title: "Payment Screenshot Required",
        description: "Please upload a payment screenshot.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.buyerName.trim() || !formData.buyerPhone.trim()) {
      toast({
        title: "Contact Information Required",
        description: "Please provide your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is trying to order from their own shop
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id')
        .eq('id', shopId)
        .single();

      if (shop?.owner_id === user.id) {
        throw new Error('You cannot order from your own shop');
      }

      // Upload screenshot
      const screenshotPath = await uploadScreenshot(formData.screenshot);

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          shop_id: shopId,
          total_amount: Number(formData.totalAmount),
          payment_method: formData.paymentMethod,
          payment_screenshot: screenshotPath,
          buyer_name: formData.buyerName,
          buyer_phone: formData.buyerPhone,
          buyer_address: formData.buyerAddress,
          screenshot_uploaded_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Created Successfully",
        description: "Your order has been submitted and is pending approval.",
      });

      onOrderCreated?.();
      onClose?.();
    } catch (error: any) {
      toast({
        title: "Order Creation Failed",
        description: error.message || "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Create Secure Order
        </CardTitle>
        <CardDescription>
          Place an order with {shopName}. Your contact details will only be visible after confirmation.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Protected:</strong> Your phone number and address will only be visible 
              to the wholesaler after they confirm your order. Payment screenshots are automatically 
              deleted after 3 days for your security.
            </AlertDescription>
          </Alert>

          {/* Order Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Order Amount (PKR) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
              placeholder="Enter total order amount"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Your Name *</Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerPhone">Your Phone *</Label>
              <Input
                id="buyerPhone"
                type="tel"
                value={formData.buyerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                placeholder="03xx-xxxxxxx"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="buyerAddress">Delivery Address</Label>
            <Textarea
              id="buyerAddress"
              value={formData.buyerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerAddress: e.target.value }))}
              placeholder="Enter your complete delivery address"
              className="min-h-[80px]"
            />
          </div>

          {/* Payment Screenshot */}
          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot * (Max 100KB)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="screenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label 
                htmlFor="screenshot" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {formData.screenshot ? formData.screenshot.name : 'Upload payment screenshot'}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, or WebP • Max 100KB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Order...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Create Secure Order
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
