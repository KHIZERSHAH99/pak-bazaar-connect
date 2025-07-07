
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, CreditCard, Building, Smartphone, MapPin } from 'lucide-react';
import { createEnhancedOrder, getWholesalerPaymentMethods } from '@/lib/enhanced-payment';
import { PaymentMethodInfo, OrderFormData } from '@/types/enhanced-payment';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedOrderFormProps {
  shopId: string;
  shopName: string;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
}

const EnhancedOrderForm: React.FC<EnhancedOrderFormProps> = ({
  shopId,
  shopName,
  onOrderCreated,
  onCancel
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    productName: '',
    quantity: 1,
    price: 0,
    totalAmount: 0,
    buyerName: '',
    buyerPhone: '',
    buyerAddress: '',
    paymentMethod: 'bank_transfer',
    paymentScreenshot: null
  });

  useEffect(() => {
    // Pre-fill form with last order data
    if (profile?.last_order_data) {
      const lastData = profile.last_order_data as any;
      setFormData(prev => ({
        ...prev,
        buyerName: lastData.buyerName || prev.buyerName,
        buyerPhone: lastData.buyerPhone || prev.buyerPhone,
        buyerAddress: lastData.buyerAddress || prev.buyerAddress,
        paymentMethod: lastData.paymentMethod || prev.paymentMethod
      }));
    }

    // Fetch payment methods for the shop
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getWholesalerPaymentMethods(shopId);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, [profile, shopId]);

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'price') {
        updated.totalAmount = updated.quantity * updated.price;
      }
      return updated;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 102400) { // 100KB limit
        toast({
          title: "File Too Large",
          description: "Please upload a screenshot smaller than 100KB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
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
      const order = await createEnhancedOrder(shopId, formData);
      
      toast({
        title: "Order Created Successfully",
        description: "Your order has been submitted and is pending wholesaler confirmation",
        variant: "default"
      });
      
      onOrderCreated(order.id);
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

  const selectedPaymentMethod = paymentMethods.find(
    method => method.wholesaler_id === shopId
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-poppins">
          <CreditCard className="h-5 w-5" />
          Place Order - {shopName}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Display */}
          {selectedPaymentMethod && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 font-poppins">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedPaymentMethod.bank_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="font-medium">Bank:</span> {selectedPaymentMethod.bank_name}
                      <br />
                      <span className="font-medium">Account:</span> {selectedPaymentMethod.account_number}
                      <br />
                      <span className="font-medium">Title:</span> {selectedPaymentMethod.account_title}
                    </div>
                  </div>
                )}
                {selectedPaymentMethod.jazzcash_number && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="font-medium">JazzCash:</span> {selectedPaymentMethod.jazzcash_number}
                    </div>
                  </div>
                )}
                {selectedPaymentMethod.easypaisa_number && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="font-medium">EasyPaisa:</span> {selectedPaymentMethod.easypaisa_number}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName" className="font-poppins">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                required
                className="font-poppins"
              />
            </div>
            
            <div>
              <Label htmlFor="quantity" className="font-poppins">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
                className="font-poppins"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="font-poppins">Unit Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                required
                className="font-poppins"
              />
            </div>
            
            <div>
              <Label htmlFor="totalAmount" className="font-poppins">Total Amount (PKR)</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount}
                readOnly
                className="font-poppins bg-gray-50"
              />
            </div>
          </div>

          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold font-poppins flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Buyer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName" className="font-poppins">Full Name</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => handleInputChange('buyerName', e.target.value)}
                  required
                  className="font-poppins"
                />
              </div>
              
              <div>
                <Label htmlFor="buyerPhone" className="font-poppins">Phone Number</Label>
                <Input
                  id="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                  required
                  className="font-poppins"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="buyerAddress" className="font-poppins">Delivery Address</Label>
              <Textarea
                id="buyerAddress"
                value={formData.buyerAddress}
                onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
                required
                className="font-poppins"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label htmlFor="paymentMethod" className="font-poppins">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger className="font-poppins">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <Label htmlFor="paymentScreenshot" className="font-poppins">Payment Screenshot</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600 font-poppins">
                {selectedFile ? (
                  <span className="text-green-600 font-medium">{selectedFile.name}</span>
                ) : (
                  <>
                    <span>Click to upload payment screenshot</span>
                    <br />
                    <span className="text-xs">Max file size: 100KB</span>
                  </>
                )}
              </div>
              <input
                id="paymentScreenshot"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 font-poppins"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Order...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderForm;
