import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SecureOrderFormInput } from './SecureOrderFormInput';
import { Upload, CreditCard, Smartphone, Building, AlertCircle, CheckCircle, Loader2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validatePakistaniPhone } from '@/lib/validation';
import { createOrderWithPayment } from '@/lib/orders-enhanced';
import { getPaymentMethodsForShop } from '@/lib/payment-methods';
import { getProductById } from '@/lib/products';
import { PaymentMethodInfo, PaymentMethod } from '@/lib/types';
import { calculateShippingCost, ShippingCalculation } from '@/lib/shipping';
import { useLanguage } from '@/contexts/LanguageContext';
interface EnhancedOrderFormProps {
  shopId: string;
  shopName: string;
  totalAmount: number;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
  productId?: string;
  productWeight?: number;
}
const EnhancedOrderForm: React.FC<EnhancedOrderFormProps> = ({
  shopId,
  shopName,
  totalAmount,
  onOrderCreated,
  onCancel,
  productId,
  productWeight = 0
}) => {
  const {
    t
  } = useLanguage();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank_transfer');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    order_notes: ''
  });
  const [shippingInfo, setShippingInfo] = useState<ShippingCalculation | null>(null);
  const [isExpress, setIsExpress] = useState(false);
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
        let finalShopId = shopId;
        let finalShopName = shopName;

        // If we have a productId and no shopId, try to resolve shop info from product
        if (productId && (!shopId || shopId.trim() === '' || shopId === 'undefined')) {
          const product = await getProductById(productId);
          if (product && product.shops && product.shop_id) {
            finalShopId = product.shop_id;
            finalShopName = product.shops.name || shopName;
          } else {
            setPaymentMethodsError('Unable to find shop information for this product');
            setIsLoadingPaymentMethods(false);
            return;
          }
        }

        // Validate that we have a valid shop ID
        if (!finalShopId || finalShopId.trim() === '' || finalShopId === 'undefined') {
          setPaymentMethodsError('Shop information is missing');
          setIsLoadingPaymentMethods(false);
          return;
        }
        setResolvedShopId(finalShopId);
        setResolvedShopName(finalShopName);
        const methods = await getPaymentMethodsForShop(finalShopId);
        setPaymentMethods(methods);

        // Set default payment method if available
        if (methods) {
          if (methods.bank_name && methods.account_number) {
            setSelectedMethod('bank_transfer');
          } else if (methods.jazzcash_number) {
            setSelectedMethod('jazzcash');
          } else if (methods.easypaisa_number) {
            setSelectedMethod('easypaisa');
          }
        }
      } catch (error: any) {
        console.error('Error fetching payment methods:', error);
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

  // Calculate shipping when city or express option changes
  useEffect(() => {
    const fetchShipping = async () => {
      if (resolvedShopId && buyerInfo.city) {
        const shipping = await calculateShippingCost(resolvedShopId, totalAmount, buyerInfo.city, productWeight, isExpress);
        setShippingInfo(shipping);
      }
    };
    fetchShipping();
  }, [resolvedShopId, totalAmount, buyerInfo.city, productWeight, isExpress]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Payment screenshot must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setScreenshot(file);
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
    if (!buyerInfo.name || !buyerInfo.phone || !buyerInfo.address || !buyerInfo.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all buyer information fields",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const finalAmount = totalAmount + (shippingInfo?.cost || 0);
      const order = await createOrderWithPayment(resolvedShopId, finalAmount, selectedMethod, screenshot, {
        buyer_name: buyerInfo.name,
        buyer_phone: buyerInfo.phone,
        buyer_address: `${buyerInfo.address}, ${buyerInfo.city}`,
        order_notes: buyerInfo.order_notes || undefined
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
    const grandTotal = totalAmount + (shippingInfo?.cost || 0);
    switch (selectedMethod) {
      case 'bank_transfer':
        return paymentMethods.bank_name && paymentMethods.account_number ? <div className="space-y-2 p-4 border border-green-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-800">{t('bankTransferDetails')}:</p>
            </div>
            <div className="space-y-1 text-sm my-[17px]">
              <p className="font-extrabold text-[#000b06] py-px text-base mx-0 px-0">
                <span className="font-medium">{t('bank')}:</span> {paymentMethods.bank_name}
              </p>
              <p className="text-[#000a00] my-0 font-extrabold py-[3px] text-base">
                <span className="font-medium">{t('accountNumber')}:</span> {paymentMethods.account_number}
              </p>
              {paymentMethods.account_title && <p className="text-[#000a00] my-px py-0 font-extrabold text-base">
                  <span className="font-medium">{t('accountTitle')}:</span> {paymentMethods.account_title}
                </p>}
            </div>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 {t('transferExactAmount').replace('{amount}', grandTotal.toLocaleString())}
            </div>
          </div> : null;
      case 'jazzcash':
        return paymentMethods.jazzcash_number ? <div className="space-y-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <p className="font-medium text-orange-800">{t('jazzcashDetails')}:</p>
            </div>
            <p className="font-extrabold text-lg py-[6px] text-red-700">
              <span className="font-medium">{t('mobileNumber')}:</span> {paymentMethods.jazzcash_number}
            </p>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 {t('sendToJazzcash').replace('{amount}', grandTotal.toLocaleString())}
            </div>
          </div> : null;
      case 'easypaisa':
        return paymentMethods.easypaisa_number ? <div className="space-y-2 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <p className="font-medium text-teal-800">{t('easypaisaDetails')}:</p>
            </div>
            <p className="text-base py-[11px] font-semibold text-[#00c96f]">
              <span className="font-medium">{t('mobileNumber')}:</span> {paymentMethods.easypaisa_number}
            </p>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 {t('sendToEasypaisa').replace('{amount}', grandTotal.toLocaleString())}
            </div>
          </div> : null;
    }
  };
  const hasAnyPaymentMethod = paymentMethods && (paymentMethods.bank_name && paymentMethods.account_number || paymentMethods.jazzcash_number || paymentMethods.easypaisa_number);
  return <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-poppins">{t('createOrder')} - {resolvedShopName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">{t('buyerInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SecureOrderFormInput id="buyerName" label={t('fullName')} value={buyerInfo.name} onChange={value => setBuyerInfo({
              ...buyerInfo,
              name: value
            })} placeholder={t('enterFullName')} required validation="text" maxLength={100} />
              <SecureOrderFormInput id="buyerPhone" label={t('pakistaniMobileNumber')} value={buyerInfo.phone} onChange={value => setBuyerInfo({
              ...buyerInfo,
              phone: value
            })} type="phone" placeholder="03XX-XXXXXXX" required validation="phone" maxLength={15} />
              <SecureOrderFormInput id="buyerCity" label={t('city')} value={buyerInfo.city} onChange={value => setBuyerInfo({
              ...buyerInfo,
              city: value
            })} placeholder="e.g., Karachi, Lahore" required validation="text" maxLength={100} />
            </div>
            <SecureOrderFormInput id="buyerAddress" label={t('streetAddress')} value={buyerInfo.address} onChange={value => setBuyerInfo({
            ...buyerInfo,
            address: value
          })} type="textarea" placeholder={t('enterStreetAddress')} required validation="description" maxLength={500} />
            
            {/* Order Notes */}
            <div className="mt-4">
              <SecureOrderFormInput 
                id="orderNotes" 
                label="Order Notes / Special Instructions (Optional)" 
                value={buyerInfo.order_notes} 
                onChange={value => setBuyerInfo({...buyerInfo, order_notes: value})} 
                type="textarea" 
                placeholder="Any special requirements or delivery instructions..." 
                validation="description" 
                maxLength={500} 
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3 p-4 border border-border bg-[#6ab45c]/[0.28] rounded-2xl">
            <h3 className="font-semibold font-poppins text-lg">{t('orderSummary')}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('productTotal')}:</span>
                <span className="font-semibold">PKR {totalAmount.toLocaleString()}</span>
              </div>
              
              {shippingInfo && <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {t('shippingCost')}:
                    </span>
                    <span className="font-semibold">PKR {shippingInfo.cost.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delivery in {shippingInfo.delivery_days} days • {shippingInfo.message}
                  </p>
                </>}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{t('totalAmount')}:</span>
                  <span className="text-xl font-bold text-primary">
                    PKR {(totalAmount + (shippingInfo?.cost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins">{t('paymentMethod')}</h3>
            
            {isLoadingPaymentMethods ? <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground font-poppins">
                  {t('loadingPaymentMethods')}
                </p>
              </div> : paymentMethodsError ? <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 font-poppins">
                    {t('error')}: {paymentMethodsError}
                  </p>
                </div>
              </div> : !hasAnyPaymentMethod ? <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-poppins">
                    {t('noPaymentMethods')}
                  </p>
                </div>
              </div> : <>
                <Select value={selectedMethod} onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPaymentMethod')} />
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
            <h3 className="font-semibold font-poppins">{t('paymentScreenshot')} *</h3>
            {!screenshot ? <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="screenshot" className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80">
                    {t('clickToUpload')}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">{t('maxFileSize').replace('{size}', '5MB')}</p>
                </Label>
                <Input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div> : <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">✓ {t('paymentScreenshot')} uploaded</p>
                  <Button type="button" variant="outline" size="sm" onClick={removeScreenshot}>
                    {t('delete')}
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
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasAnyPaymentMethod} className="flex-1">
              {isSubmitting ? t('creatingOrder') : t('createOrder')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>;
};
export default EnhancedOrderForm;