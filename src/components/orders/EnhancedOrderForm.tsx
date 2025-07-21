
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CreditCard, Smartphone, Building, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrderWithPayment } from '@/lib/orders-enhanced';
import { getPaymentMethodsForShop } from '@/lib/payment-methods';
import { getProductById } from '@/lib/products';
import { PaymentMethodInfo, PaymentMethod } from '@/lib/types';

interface EnhancedOrderFormProps {
  shopId: string;
  shopName: string;
  totalAmount: number;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
  productId?: string;
}

const EnhancedOrderForm: React.FC<EnhancedOrderFormProps> = ({
  shopId,
  shopName,
  totalAmount,
  onOrderCreated,
  onCancel,
  productId
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank_transfer');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [resolvedShopId, setResolvedShopId] = useState<string>('');
  const [resolvedShopName, setResolvedShopName] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoadingPaymentMethods(true);
        let finalShopId = shopId;
        let finalShopName = shopName;

        console.log('EnhancedOrderForm - Initial props:', { 
          shopId, 
          shopName, 
          productId, 
          totalAmount 
        });

        // If we have a product ID, resolve it to get accurate shop info
        if (productId) {
          console.log('Resolving product to shop for product ID:', productId);
          const product = await getProductById(productId);
          console.log('Product resolved:', product);
          
          if (product) {
            finalShopId = product.shop_id;
            finalShopName = product.shops?.name || shopName;
            console.log('Resolved shop info from product:', { 
              finalShopId, 
              finalShopName,
              productShopData: product.shops
            });
          } else {
            console.error('Product not found for ID:', productId);
          }
        }

        setResolvedShopId(finalShopId);
        setResolvedShopName(finalShopName);

        console.log('Fetching payment methods for shop:', finalShopId);
        const methods = await getPaymentMethodsForShop(finalShopId);
        console.log('Payment methods response:', methods);
        
        setPaymentMethods(methods);
        setDebugInfo({
          shopId: finalShopId,
          shopName: finalShopName,
          paymentMethods: methods,
          productId,
          hasPaymentMethods: !!methods,
          availableMethods: methods ? {
            bank: !!methods.bank_name,
            jazzcash: !!methods.jazzcash_number,
            easypaisa: !!methods.easypaisa_number
          } : null
        });

        // Set default payment method if available
        if (methods) {
          if (methods.bank_name) {
            setSelectedMethod('bank_transfer');
          } else if (methods.jazzcash_number) {
            setSelectedMethod('jazzcash');
          } else if (methods.easypaisa_number) {
            setSelectedMethod('easypaisa');
          }
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
        toast({
          title: "Error",
          description: "Failed to load payment methods. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [shopId, shopName, productId, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024) { // 100KB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 100KB",
          variant: "destructive"
        });
        return;
      }
      setScreenshot(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    // Reset file input
    const input = document.getElementById('screenshot') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', {
      resolvedShopId,
      totalAmount,
      selectedMethod,
      buyerInfo,
      hasScreenshot: !!screenshot,
      paymentMethods
    });
    
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
      const order = await createOrderWithPayment(resolvedShopId, totalAmount, selectedMethod, screenshot, {
        buyer_name: buyerInfo.name,
        buyer_phone: buyerInfo.phone,
        buyer_address: buyerInfo.address
      });

      console.log('Order created successfully:', order);

      if (!order) {
        throw new Error('Failed to create order');
      }

      toast({
        title: "Order Created Successfully",
        description: `Your order has been submitted and is pending approval from ${resolvedShopName}`,
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
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <p className="font-medium text-foreground">Bank Transfer Details:</p>
            <p className="text-foreground">Bank: {paymentMethods.bank_name}</p>
            <p className="text-foreground">Account: {paymentMethods.account_number}</p>
            <p className="text-foreground">Title: {paymentMethods.account_title}</p>
          </div>
        ) : null;
      case 'jazzcash':
        return paymentMethods.jazzcash_number ? (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <p className="font-medium text-foreground">JazzCash Details:</p>
            <p className="text-foreground">Number: {paymentMethods.jazzcash_number}</p>
          </div>
        ) : null;
      case 'easypaisa':
        return paymentMethods.easypaisa_number ? (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <p className="font-medium text-foreground">EasyPaisa Details:</p>
            <p className="text-foreground">Number: {paymentMethods.easypaisa_number}</p>
          </div>
        ) : null;
    }
  };

  const hasAnyPaymentMethod = paymentMethods && (
    paymentMethods.bank_name || 
    paymentMethods.jazzcash_number || 
    paymentMethods.easypaisa_number
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-poppins">Create Order - {resolvedShopName}</CardTitle>
        <p className="text-lg font-semibold text-primary">
          Total Amount: PKR {totalAmount.toLocaleString()}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        )}
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
            
            {isLoadingPaymentMethods ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground font-poppins">
                  Loading payment methods...
                </p>
              </div>
            ) : !hasAnyPaymentMethod ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-poppins">
                    No payment methods available for this shop. Please contact the wholesaler to set up payment methods.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Select value={selectedMethod} onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.bank_name && (
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('bank_transfer')}
                          Bank Transfer
                        </div>
                      </SelectItem>
                    )}
                    {paymentMethods?.jazzcash_number && (
                      <SelectItem value="jazzcash">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('jazzcash')}
                          JazzCash
                        </div>
                      </SelectItem>
                    )}
                    {paymentMethods?.easypaisa_number && (
                      <SelectItem value="easypaisa">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('easypaisa')}
                          EasyPaisa
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {getPaymentDetails()}
              </>
            )}
          </div>

          {/* Payment Screenshot Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Payment Screenshot *</h3>
            {!screenshot ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="screenshot" className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80">
                    Click to upload payment screenshot
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 100KB</p>
                </Label>
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">✓ Payment screenshot uploaded</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeScreenshot}
                  >
                    Remove
                  </Button>
                </div>
                {screenshotPreview && (
                  <div className="mt-3">
                    <img 
                      src={screenshotPreview} 
                      alt="Payment screenshot preview"
                      className="max-w-full h-auto max-h-48 mx-auto rounded border"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">{screenshot.name}</p>
              </div>
            )}
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
              disabled={isSubmitting || !hasAnyPaymentMethod}
              className="flex-1"
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
