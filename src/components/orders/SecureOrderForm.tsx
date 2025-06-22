
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, AlertTriangle, Lock } from 'lucide-react';
import { createOrderWithPaymentEnhanced } from '@/lib/orders/core-enhanced';
import { PaymentMethod } from '@/lib/types';

interface SecureOrderFormProps {
  shopId: string;
  shopName: string;
  onOrderCreated?: () => void;
}

export const SecureOrderForm: React.FC<SecureOrderFormProps> = ({ 
  shopId, 
  shopName, 
  onOrderCreated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    totalAmount: '',
    paymentMethod: '' as PaymentMethod,
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    screenshot: null as File | null,
  });

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!formData.screenshot) throw new Error('Payment screenshot is required');
      
      return createOrderWithPaymentEnhanced(shopId, Number(formData.totalAmount), {
        method: formData.paymentMethod,
        screenshot: formData.screenshot,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        buyerAddress: formData.buyerAddress,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order Created Successfully",
        description: "Your order has been submitted and is pending approval.",
      });
      resetForm();
      onOrderCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Order Creation Failed",
        description: error.message || "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      totalAmount: '',
      paymentMethod: '' as PaymentMethod,
      buyerName: '',
      buyerPhone: '',
      buyerAddress: '',
      screenshot: null,
    });
  };

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

    if (!formData.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
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
      await createOrderMutation.mutateAsync();
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
          Place an order with {shopName}. All information is encrypted and secure.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Order Process</p>
                <p className="mt-1">
                  Your order details and payment screenshot are encrypted and only visible 
                  to you and the wholesaler. We never store sensitive payment information.
                </p>
              </div>
            </div>
          </div>

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
              onValueChange={(value: PaymentMethod) => 
                setFormData(prev => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
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
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || createOrderMutation.isPending}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Secure Order...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Create Secure Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
