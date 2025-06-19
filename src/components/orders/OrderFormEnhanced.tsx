
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, CreditCard, Smartphone, Building } from 'lucide-react';
import { createOrderWithPaymentEnhanced } from '@/lib/orders/core-enhanced';
import { PaymentMethod } from '@/lib/types';

interface OrderFormEnhancedProps {
  shopId: string;
  shopName: string;
  onOrderCreated?: (orderId: string) => void;
  onClose?: () => void;
}

export const OrderFormEnhanced: React.FC<OrderFormEnhancedProps> = ({
  shopId,
  shopName,
  onOrderCreated,
  onClose
}) => {
  const [formData, setFormData] = useState({
    totalAmount: '',
    paymentMethod: 'bank_transfer' as PaymentMethod,
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    paymentScreenshot: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 102400) { // 100KB limit
        toast({
          title: "File Too Large",
          description: "Payment screenshot must be less than 100KB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, paymentScreenshot: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentScreenshot) {
      toast({
        title: "Payment Screenshot Required",
        description: "Please upload a payment screenshot",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrderWithPaymentEnhanced(
        shopId,
        parseFloat(formData.totalAmount),
        {
          method: formData.paymentMethod,
          screenshot: formData.paymentScreenshot,
          buyerName: formData.buyerName,
          buyerPhone: formData.buyerPhone,
          buyerAddress: formData.buyerAddress
        }
      );

      toast({
        title: "Order Created Successfully",
        description: "Your order has been submitted for approval",
      });

      onOrderCreated?.(order.id);
      onClose?.();
    } catch (error: any) {
      toast({
        title: "Failed to Create Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'jazzcash':
      case 'easypaisa':
        return <Smartphone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Order - {shopName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="totalAmount">Total Amount (PKR)</Label>
            <Input
              id="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
              placeholder="Enter total amount"
              required
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value: PaymentMethod) => 
              setFormData(prev => ({ ...prev, paymentMethod: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="jazzcash">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    JazzCash
                  </div>
                </SelectItem>
                <SelectItem value="easypaisa">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    EasyPaisa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="buyerName">Your Name</Label>
            <Input
              id="buyerName"
              value={formData.buyerName}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyerPhone">Phone Number</Label>
            <Input
              id="buyerPhone"
              value={formData.buyerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
              placeholder="03XXXXXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyerAddress">Delivery Address</Label>
            <Textarea
              id="buyerAddress"
              value={formData.buyerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerAddress: e.target.value }))}
              placeholder="Enter complete delivery address"
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
            <div className="mt-1">
              <input
                id="paymentScreenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="paymentScreenshot"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.paymentScreenshot ? formData.paymentScreenshot.name : 'Click to upload payment screenshot'}
                  </p>
                  <p className="text-xs text-gray-500">Max 100KB</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
