import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Phone, MapPin, User, FileText } from 'lucide-react';

interface GuestOrderFormProps {
  shopId: string;
  shopName: string;
  onOrderCreated?: (orderId: string) => void;
  onClose?: () => void;
}

const GuestOrderForm: React.FC<GuestOrderFormProps> = ({
  shopId,
  shopName,
  onOrderCreated,
  onClose
}) => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    totalAmount: '',
    orderNotes: '',
    paymentMethod: 'bank_transfer'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buyerName || !formData.buyerPhone || !formData.totalAmount) {
      toast({
        title: "Please fill required fields",
        description: "Name, phone, and order amount are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create order as guest (without buyer_id)
      const { data, error } = await supabase
        .from('orders')
        .insert({
          shop_id: shopId,
          buyer_id: '00000000-0000-0000-0000-000000000000', // Guest user placeholder
          total_amount: parseFloat(formData.totalAmount),
          payment_method: formData.paymentMethod,
          buyer_name: formData.buyerName,
          buyer_phone: formData.buyerPhone,
          buyer_address: formData.buyerAddress,
          order_notes: formData.orderNotes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.id.slice(0, 8)} has been submitted to ${shopName}`,
        variant: "default"
      });

      if (onOrderCreated) {
        onOrderCreated(data.id);
      }

      // Reset form
      setFormData({
        buyerName: '',
        buyerPhone: '',
        buyerAddress: '',
        totalAmount: '',
        orderNotes: '',
        paymentMethod: 'bank_transfer'
      });

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-poppins">
          <ShoppingCart className="h-5 w-5" />
          Place Order - {shopName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Name *
              </Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData(prev => ({...prev, buyerName: e.target.value}))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="buyerPhone"
                value={formData.buyerPhone}
                onChange={(e) => setFormData(prev => ({...prev, buyerPhone: e.target.value}))}
                placeholder="03001234567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </Label>
            <Textarea
              id="buyerAddress"
              value={formData.buyerAddress}
              onChange={(e) => setFormData(prev => ({...prev, buyerAddress: e.target.value}))}
              placeholder="Enter your complete address for delivery"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Order Amount (PKR) *</Label>
              <Input
                id="totalAmount"
                type="number"
                min="1"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({...prev, totalAmount: e.target.value}))}
                placeholder="Enter total amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({...prev, paymentMethod: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderNotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Details/Notes
            </Label>
            <Textarea
              id="orderNotes"
              value={formData.orderNotes}
              onChange={(e) => setFormData(prev => ({...prev, orderNotes: e.target.value}))}
              placeholder="Describe what you want to order, quantities, specifications, etc."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuestOrderForm;