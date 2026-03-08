import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createOrderWithPayment } from '@/lib/orders';
import { MapPin, Package, CreditCard, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const { items, clearCart, getTotalPrice } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    buyerName: profile?.contact_name || '',
    buyerPhone: profile?.phone_number || '',
    buyerAddress: profile?.address || '',
    paymentMethod: 'bank_transfer'
  });

  const cartByShop = Array.from(items.reduce((acc, item) => {
    const shopId = item.shopId;
    if (!acc.has(shopId)) {
      acc.set(shopId, []);
    }
    acc.get(shopId)?.push(item);
    return acc;
  }, new Map()).entries());

  const handleInputChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrders = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place orders",
        variant: "destructive"
      });
      return;
    }

    if (!orderForm.buyerName || !orderForm.buyerPhone || !orderForm.buyerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create separate orders for each shop
      for (const [shopId, shopItems] of cartByShop) {
        const totalAmount = shopItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        await createOrder({
          shopId,
          totalAmount,
          buyerName: orderForm.buyerName,
          buyerPhone: orderForm.buyerPhone,
          buyerAddress: orderForm.buyerAddress,
          paymentMethod: orderForm.paymentMethod
        });
      }

      clearCart();
      toast({
        title: "Orders Placed Successfully",
        description: `${cartByShop.length} order(s) have been placed successfully`,
      });
      navigate('/dashboard/orders');
    } catch (error: any) {
      console.error('Error placing orders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some products to your cart to checkout</p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyerName">Full Name *</Label>
                      <Input
                        id="buyerName"
                        value={orderForm.buyerName}
                        onChange={(e) => handleInputChange('buyerName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buyerPhone">Phone Number *</Label>
                      <Input
                        id="buyerPhone"
                        value={orderForm.buyerPhone}
                        onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="buyerAddress">Delivery Address *</Label>
                    <Input
                      id="buyerAddress"
                      value={orderForm.buyerAddress}
                      onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
                      placeholder="Enter your complete delivery address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Bank Transfer</strong> - You will receive payment details after order confirmation
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items by Shop */}
              {cartByShop.map(([shopId, shopItems]) => {
                const shopTotal = shopItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                return (
                  <Card key={shopId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {shopItems[0]?.product.shops?.name || `Shop ${shopId}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shopItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.product.image || '/placeholder.svg'}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div>
                                <h4 className="font-medium">{item.product.name}</h4>
                                <p className="text-sm text-gray-600">
                                  PKR {item.product.price.toLocaleString()} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-pakistani_green-600">
                              PKR {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold">
                          <span>Shop Total:</span>
                          <span className="text-pakistani_green-600">PKR {shopTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({items.length}):</span>
                      <span>PKR {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-pakistani_green-600">PKR {getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrders}
                    disabled={loading}
                    className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700"
                    size="lg"
                  >
                    {loading ? 'Placing Orders...' : `Place ${cartByShop.length} Order(s)`}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;