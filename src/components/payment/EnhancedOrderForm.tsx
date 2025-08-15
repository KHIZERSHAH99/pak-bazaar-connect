
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CreditCard, Smartphone, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrderWithPayment } from '@/lib/orders-enhanced';
import { getPaymentMethodsForShop } from '@/lib/payment-methods';
import { PaymentMethodInfo, PaymentMethod } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/common/FileUpload';

interface EnhancedOrderFormProps {
  shopId: string;
  shopName: string;
  totalAmount?: number;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
}

const EnhancedOrderForm: React.FC<EnhancedOrderFormProps> = ({
  shopId,
  shopName,
  totalAmount = 0,
  onOrderCreated,
  onCancel
}) => {
  const { profile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank_transfer');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      console.log('Fetching payment methods for shop:', shopId);
      const methods = await getPaymentMethodsForShop(shopId);
      console.log('Payment methods response:', methods);
      setPaymentMethods(methods);
    };
    fetchPaymentMethods();
  }, [shopId]);

  // Load previous order data if available
  useEffect(() => {
    if (profile && shopId) {
      // Use default values since last_order_data doesn't exist in Profile type
      setBuyerInfo({
        name: profile.contact_name || '',
        phone: profile.phone_number || '',
        address: profile.address || ''
      });
    }
  }, [profile, shopId]);

  const handleFileSelect = (file: File) => {
    setScreenshot(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!screenshot) {
      toast({
        title: "Payment Screenshot Required",
        description: "Please upload a payment screenshot",
        variant: "destructive"
      });
      return;
    }

    if (!buyerInfo.name || !buyerInfo.phone || !buyerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all buyer information fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrderWithPayment(shopId, totalAmount, selectedMethod, screenshot);

      toast({
        title: "Order Created Successfully",
        description: `Your order has been submitted and is pending approval from ${shopName}`,
        variant: "default"
      });

      onOrderCreated(order.id);
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'jazzcash': return <Smartphone className="h-4 w-4" />;
      case 'easypaisa': return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentDetails = () => {
    if (!paymentMethods) return null;

    switch (selectedMethod) {
      case 'bank_transfer':
        return paymentMethods.bank_name && paymentMethods.account_number ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">Bank Transfer Details:</p>
            <p>Bank: {paymentMethods.bank_name}</p>
            <p>Account: {paymentMethods.account_number}</p>
            <p>Title: {paymentMethods.account_title}</p>
          </div>
        ) : null;
      case 'jazzcash':
        return paymentMethods.jazzcash_number ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">JazzCash Details:</p>
            <p>Number: {paymentMethods.jazzcash_number}</p>
          </div>
        ) : null;
      case 'easypaisa':
        return paymentMethods.easypaisa_number ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">EasyPaisa Details:</p>
            <p>Number: {paymentMethods.easypaisa_number}</p>
          </div>
        ) : null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-poppins">Create Order - {shopName}</CardTitle>
        <p className="text-lg font-semibold text-pakistani_green-600">
          Total Amount: PKR {totalAmount.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName">Full Name *</Label>
                <Input
                  id="buyerName"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="buyerPhone">Phone Number *</Label>
                <Input
                  id="buyerPhone"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  placeholder="03XX-XXXXXXX"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="buyerAddress">Delivery Address *</Label>
              <Textarea
                id="buyerAddress"
                value={buyerInfo.address}
                onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                placeholder="Enter complete delivery address"
                required
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Payment Method</h3>
            
            {paymentMethods && (paymentMethods.bank_name || paymentMethods.jazzcash_number || paymentMethods.easypaisa_number) ? (
              <>
                <Select value={selectedMethod} onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.bank_name && (
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('bank_transfer')}
                          Bank Transfer ({paymentMethods.bank_name})
                        </div>
                      </SelectItem>
                    )}
                    {paymentMethods.jazzcash_number && (
                      <SelectItem value="jazzcash">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('jazzcash')}
                          JazzCash ({paymentMethods.jazzcash_number})
                        </div>
                      </SelectItem>
                    )}
                    {paymentMethods.easypaisa_number && (
                      <SelectItem value="easypaisa">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('easypaisa')}
                          EasyPaisa ({paymentMethods.easypaisa_number})
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {getPaymentDetails()}
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm text-yellow-700">
                  No payment methods available for this shop. Please contact the wholesaler to set up payment methods.
                </span>
              </div>
            )}
          </div>

          {/* Payment Screenshot Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Payment Screenshot *</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSize={100}
              currentFile={screenshot}
              placeholder="Click to upload payment screenshot"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderForm;
