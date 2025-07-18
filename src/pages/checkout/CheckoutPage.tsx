
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/orders';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Truck } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { state, getCartForShop, clearCart } = useCart();
  const { toast } = useToast();

  const [orderData, setOrderData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    paymentMethod: 'bank_transfer',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = shopId ? getCartForShop(shopId) : [];
  const shopTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (!shopId || cartItems.length === 0) {
      toast({
        title: "No items to checkout",
        description: "Please add items to cart before checkout.",
        variant: "destructive"
      });
      navigate('/products');
    }
  }, [shopId, cartItems, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!shopId) throw new Error('Shop ID is required');

      // Create order using the enhanced order creation
      await createOrder({
        shopId,
        totalAmount: shopTotal,
        paymentMethod: orderData.paymentMethod,
        buyerName: orderData.buyerName,
        buyerPhone: orderData.buyerPhone,
        buyerAddress: orderData.buyerAddress
      });

      // Clear cart items for this shop
      cartItems.forEach(item => {
        // Note: This would need to be implemented in the cart context
        // For now, we'll clear the entire cart
      });

      toast({
        title: "Order Created Successfully!",
        description: "Your order has been submitted. You'll receive updates on the status.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  const shopName = cartItems[0]?.shopName || 'Unknown Shop';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 font-poppins">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyerName">Full Name *</Label>
                <Input
                  id="buyerName"
                  value={orderData.buyerName}
                  onChange={(e) => setOrderData(prev => ({ ...prev, buyerName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyerPhone">Phone Number *</Label>
                <Input
                  id="buyerPhone"
                  value={orderData.buyerPhone}
                  onChange={(e) => setOrderData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                  placeholder="+92 300 1234567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyerAddress">Delivery Address *</Label>
                <Textarea
                  id="buyerAddress"
                  value={orderData.buyerAddress}
                  onChange={(e) => setOrderData(prev => ({ ...prev, buyerAddress: e.target.value }))}
                  placeholder="Enter complete delivery address"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={orderData.notes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or requirements"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={orderData.paymentMethod}
                onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}
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
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">{shopName}</h3>
                
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-semibold">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {shopTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>TBD</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>Rs. {shopTotal.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
