import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { createOrderWithPaymentEnhanced } from '@/lib/orders/enhanced-create';
import { AddressBook } from '@/components/address/AddressBook';
import { MapPin, Banknote, Upload } from 'lucide-react';

interface Province {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  province_id: string;
  name: string;
  is_major: boolean;
}

interface EnhancedOrderFormProps {
  shopId: string;
  shopName: string;
  onOrderCreated?: (orderId: string) => void;
  onClose?: () => void;
}

export const EnhancedOrderFormWithAddress = ({ 
  shopId, 
  shopName, 
  onOrderCreated, 
  onClose 
}: EnhancedOrderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [useAddressBook, setUseAddressBook] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  
  const [formData, setFormData] = useState({
    totalAmount: '',
    paymentMethod: 'bank_transfer',
    // Contact info
    buyerName: '',
    buyerPhone: '',
    // Address fields
    streetAddress: '',
    area: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    deliveryInstructions: '',
    // Shipping preferences
    shippingMethod: 'standard'
  });
  
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  useEffect(() => {
    fetchProvincesAndCities();
  }, []);

  useEffect(() => {
    // Filter cities based on selected province
    if (formData.province) {
      const selectedProvince = provinces.find(p => p.name === formData.province);
      if (selectedProvince) {
        const provinceCities = cities.filter(c => c.province_id === selectedProvince.id);
        setFilteredCities(provinceCities);
      }
    }
  }, [formData.province, provinces, cities]);

  const fetchProvincesAndCities = async () => {
    try {
      const [provincesRes, citiesRes] = await Promise.all([
        supabase.from('provinces').select('*').order('name'),
        supabase.from('cities').select('*').order('name')
      ]);

      if (provincesRes.data) setProvinces(provincesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
    } catch (error) {
      console.error('Error fetching provinces and cities:', error);
    }
  };

  const handleAddressSelect = (address: any) => {
    setFormData({
      ...formData,
      buyerName: address.contact_name || formData.buyerName,
      buyerPhone: address.contact_phone || formData.buyerPhone,
      streetAddress: address.street_address,
      area: address.area || '',
      city: address.city,
      province: address.province,
      postalCode: address.postal_code,
      deliveryInstructions: address.instructions || ''
    });
    setUseAddressBook(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Payment screenshot must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setPaymentScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.totalAmount || !formData.buyerName || !formData.buyerPhone || !formData.streetAddress || !formData.city || !formData.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!paymentScreenshot) {
      toast({
        title: "Payment Screenshot Required",
        description: "Please upload a payment screenshot",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Construct full address
      const fullAddress = [
        formData.streetAddress,
        formData.area,
        formData.city,
        formData.province,
        formData.postalCode
      ].filter(Boolean).join(', ');

      const orderId = await createOrderWithPaymentEnhanced({
        shopId,
        totalAmount: parseFloat(formData.totalAmount),
        paymentMethod: formData.paymentMethod as any,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        buyerAddress: fullAddress,
        buyerStreetAddress: formData.streetAddress,
        buyerArea: formData.area,
        buyerCity: formData.city,
        buyerProvince: formData.province,
        buyerPostalCode: formData.postalCode,
        deliveryInstructions: formData.deliveryInstructions,
        shippingMethod: formData.shippingMethod,
        paymentScreenshot
      });

      if (orderId) {
        toast({
          title: "Order Created Successfully",
          description: `Your order for ${shopName} has been placed.`
        });
        
        onOrderCreated?.(orderId);
        onClose?.();
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Create Order for {shopName}</h3>
          <p className="text-sm text-muted-foreground">
            Fill in your details and upload payment proof
          </p>
        </div>

        {/* Order Amount */}
        <div>
          <Label htmlFor="amount">Order Amount (PKR) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter total amount"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            required
            min="1"
            step="0.01"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Information
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Name *</Label>
              <Input
                placeholder="Full name"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={formData.buyerPhone}
                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Address Book Option */}
          <div className="flex items-center justify-between">
            <Label>Delivery Address</Label>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setUseAddressBook(!useAddressBook)}
            >
              {useAddressBook ? 'Enter manually' : 'Use saved address'}
            </Button>
          </div>

          {useAddressBook ? (
            <AddressBook 
              onSelectAddress={handleAddressSelect}
              showSelection={true}
            />
          ) : (
            <>
              <div>
                <Label>Street Address *</Label>
                <Input
                  placeholder="House/Building No, Street name"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Area/Locality</Label>
                <Input
                  placeholder="e.g., Gulberg, DHA, Model Town"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Province *</Label>
                  <Select 
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province.id} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>City *</Label>
                  <Select 
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    required
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Select city (required for shipping)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map(city => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name} {city.is_major && '★'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    City is required to calculate accurate shipping costs
                  </p>
                </div>
              </div>

              <div>
                <Label>Postal Code *</Label>
                <Input
                  placeholder="5-digit postal code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <Label>Delivery Instructions</Label>
                <Textarea
                  placeholder="Any special instructions for delivery"
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        {/* Shipping Method */}
        <div>
          <Label>Shipping Method</Label>
          <Select 
            value={formData.shippingMethod}
            onValueChange={(value) => setFormData({ ...formData, shippingMethod: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Delivery (3-5 days)</SelectItem>
              <SelectItem value="express">Express Delivery (1-2 days)</SelectItem>
              <SelectItem value="courier">Courier Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div>
          <Label>Payment Method *</Label>
          <Select 
            value={formData.paymentMethod}
            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Bank Transfer
                </div>
              </SelectItem>
              <SelectItem value="jazzcash">JazzCash</SelectItem>
              <SelectItem value="easypaisa">EasyPaisa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Screenshot */}
        <div>
          <Label htmlFor="screenshot">Payment Screenshot *</Label>
          <div className="mt-2">
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="cursor-pointer"
            />
            {paymentScreenshot && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {paymentScreenshot.name}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a screenshot of your payment transaction
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Card>
  );
};