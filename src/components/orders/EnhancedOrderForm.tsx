import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CreditCard, Smartphone, Building, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);
  const [resolvedShopId, setResolvedShopId] = useState<string>(shopId);
  const [resolvedShopName, setResolvedShopName] = useState<string>(shopName);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoadingPaymentMethods(true);
        setPaymentMethodsError(null);
        console.log('🚀 EnhancedOrderForm: Starting initialization', {
          providedShopId: shopId,
          providedShopName: shopName,
          productId: productId
        });
        let finalShopId = shopId;
        let finalShopName = shopName;

        // If we have a productId and no shopId, try to resolve shop info from product
        if (productId && (!shopId || shopId.trim() === '' || shopId === 'undefined')) {
          console.log('📦 Resolving shop from productId:', productId);
          const product = await getProductById(productId);
          if (product && product.shops && product.shop_id) {
            finalShopId = product.shop_id;
            finalShopName = product.shops.name || shopName;
            console.log('✅ Product resolved to shop:', {
              finalShopId,
              finalShopName
            });
          } else {
            console.log('❌ Failed to resolve product to shop');
            setPaymentMethodsError('Unable to find shop information for this product');
            setIsLoadingPaymentMethods(false);
            return;
          }
        }

        // Validate that we have a valid shop ID
        if (!finalShopId || finalShopId.trim() === '' || finalShopId === 'undefined') {
          console.log('❌ No valid shop ID available');
          setPaymentMethodsError('Shop information is missing');
          setIsLoadingPaymentMethods(false);
          return;
        }
        setResolvedShopId(finalShopId);
        setResolvedShopName(finalShopName);
        console.log('💳 Fetching payment methods for shop:', finalShopId);
        const methods = await getPaymentMethodsForShop(finalShopId);
        console.log('📋 Payment methods response:', methods);
        setPaymentMethods(methods);

        // Set default payment method if available
        if (methods) {
          if (methods.bank_name && methods.account_number) {
            setSelectedMethod('bank_transfer');
            console.log('🏦 Default payment method set to bank_transfer');
          } else if (methods.jazzcash_number) {
            setSelectedMethod('jazzcash');
            console.log('📱 Default payment method set to jazzcash');
          } else if (methods.easypaisa_number) {
            setSelectedMethod('easypaisa');
            console.log('💸 Default payment method set to easypaisa');
          }
        } else {
          console.log('⚠️ No payment methods found for shop:', finalShopId);
        }
      } catch (error: any) {
        console.error('💥 Error fetching payment methods:', error);
        setPaymentMethodsError(error.message || 'Failed to load payment methods');
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
      if (file.size > 100 * 1024) {
        // 100KB limit
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
      reader.onload = e => {
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
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'jazzcash':
        return <Smartphone className="h-4 w-4" />;
      case 'easypaisa':
        return <CreditCard className="h-4 w-4" />;
    }
  };
  const getPaymentDetails = () => {
    if (!paymentMethods) return null;
    switch (selectedMethod) {
      case 'bank_transfer':
        return paymentMethods.bank_name && paymentMethods.account_number ? <div className="space-y-2 p-4 border border-green-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-800">Bank Transfer Details:</p>
            </div>
            <div className="space-y-1 text-sm my-[17px]">
              <p className="text-base font-extrabold text-[#000b06]"><span className="font-medium">Bank:</span> {paymentMethods.bank_name}</p>
              <p className="text-[#000a00] my-0 font-extrabold"><span className="font-medium">Account Number:</span> {paymentMethods.account_number}</p>
              {paymentMethods.account_title && <p className="text-[#000a00] my-px py-0 font-extrabold"><span className="font-medium">Account Title:</span> {paymentMethods.account_title}</p>}
            </div>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 Transfer the exact amount (PKR {totalAmount.toLocaleString()}) and upload the payment screenshot below
            </div>
          </div> : null;
      case 'jazzcash':
        return paymentMethods.jazzcash_number ? <div className="space-y-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <p className="font-medium text-orange-800">JazzCash Details:</p>
            </div>
            <p className="text-sm font-extrabold text-[#000d60]"><span className="font-medium">Mobile Number:</span> {paymentMethods.jazzcash_number}</p>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 Send PKR {totalAmount.toLocaleString()} to this JazzCash number and upload the payment screenshot
            </div>
          </div> : null;
      case 'easypaisa':
        return paymentMethods.easypaisa_number ? <div className="space-y-2 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <p className="font-medium text-teal-800">EasyPaisa Details:</p>
            </div>
            <p className="text-base py-[11px] font-semibold text-[#00c96f]"><span className="font-medium">Mobile Number:</span> {paymentMethods.easypaisa_number}</p>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 Send PKR {totalAmount.toLocaleString()} to this EasyPaisa number and upload the payment screenshot
            </div>
          </div> : null;
    }
  };

  // Check if any payment method is available
  const hasAnyPaymentMethod = paymentMethods && (paymentMethods.bank_name && paymentMethods.account_number || paymentMethods.jazzcash_number || paymentMethods.easypaisa_number);
  return <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-poppins">Create Order - {resolvedShopName}</CardTitle>
        <p className="text-lg font-semibold text-primary">
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
                <Input id="buyerName" value={buyerInfo.name} onChange={e => setBuyerInfo({
                ...buyerInfo,
                name: e.target.value
              })} placeholder="Enter your full name" required />
              </div>
              <div>
                <Label htmlFor="buyerPhone">Phone Number *</Label>
                <Input id="buyerPhone" value={buyerInfo.phone} onChange={e => setBuyerInfo({
                ...buyerInfo,
                phone: e.target.value
              })} placeholder="03XX-XXXXXXX" required />
              </div>
            </div>
            <div>
              <Label htmlFor="buyerAddress">Delivery Address *</Label>
              <Textarea id="buyerAddress" value={buyerInfo.address} onChange={e => setBuyerInfo({
              ...buyerInfo,
              address: e.target.value
            })} placeholder="Enter complete delivery address" required />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Payment Method</h3>
            
            {isLoadingPaymentMethods ? <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground font-poppins">
                  Loading payment methods...
                </p>
              </div> : paymentMethodsError ? <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 font-poppins">
                    Error: {paymentMethodsError}
                  </p>
                </div>
              </div> : !hasAnyPaymentMethod ? <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-poppins">
                    No payment methods available for this shop. Please contact the wholesaler to set up payment methods.
                  </p>
                </div>
              </div> : <>
                <Select value={selectedMethod} onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.bank_name && paymentMethods?.account_number && <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('bank_transfer')}
                          Bank Transfer - {paymentMethods.bank_name}
                        </div>
                      </SelectItem>}
                    {paymentMethods?.jazzcash_number && <SelectItem value="jazzcash">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('jazzcash')}
                          JazzCash - {paymentMethods.jazzcash_number}
                        </div>
                      </SelectItem>}
                    {paymentMethods?.easypaisa_number && <SelectItem value="easypaisa">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon('easypaisa')}
                          EasyPaisa - {paymentMethods.easypaisa_number}
                        </div>
                      </SelectItem>}
                  </SelectContent>
                </Select>

                {getPaymentDetails()}
              </>}
          </div>

          {/* Payment Screenshot Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">Payment Screenshot *</h3>
            {!screenshot ? <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="screenshot" className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80">
                    Click to upload payment screenshot
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 100KB</p>
                </Label>
                <Input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div> : <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">✓ Payment screenshot uploaded</p>
                  <Button type="button" variant="outline" size="sm" onClick={removeScreenshot}>
                    Remove
                  </Button>
                </div>
                {screenshotPreview && <div className="mt-3">
                    <img src={screenshotPreview} alt="Payment screenshot preview" className="max-w-full h-auto max-h-48 mx-auto rounded border" />
                  </div>}
                <p className="text-sm text-muted-foreground mt-2">{screenshot.name}</p>
              </div>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasAnyPaymentMethod} className="flex-1">
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>;
};
export default EnhancedOrderForm;