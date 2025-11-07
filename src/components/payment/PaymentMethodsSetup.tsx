
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building, Smartphone, Plus, Edit, Check } from 'lucide-react';
import { upsertPaymentMethods, getMyPaymentMethods } from '@/lib/payment-methods';
import { PaymentMethodInfo } from '@/types/enhanced-payment';
import { useAuth } from '@/contexts/AuthContext';

const PaymentMethodsSetup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_title: '',
    jazzcash_number: '',
    easypaisa_number: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const method = await getMyPaymentMethods();
      setPaymentMethod(method);
      
      if (method) {
        setFormData({
          bank_name: method.bank_name || '',
          account_number: method.account_number || '',
          account_title: method.account_title || '',
          jazzcash_number: method.jazzcash_number || '',
          easypaisa_number: method.easypaisa_number || ''
        });
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await upsertPaymentMethods(formData);

      toast({
        title: "Payment Methods Updated",
        description: "Your payment information has been saved successfully",
        variant: "default"
      });

      setIsEditing(false);
      await fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Failed to Update Payment Methods",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPaymentMethods = Boolean(paymentMethod);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-poppins">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Payment Methods Setup
          </span>
          {hasPaymentMethods && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="font-poppins"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!hasPaymentMethods || isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold font-poppins flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Account Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name" className="font-poppins">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="e.g., HBL, UBL, Meezan Bank"
                    className="font-poppins"
                  />
                </div>
                
                <div>
                  <Label htmlFor="account_number" className="font-poppins">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    placeholder="1234567890123456"
                    className="font-poppins"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="account_title" className="font-poppins">Account Title</Label>
                <Input
                  id="account_title"
                  value={formData.account_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_title: e.target.value }))}
                  placeholder="Account holder name"
                  className="font-poppins"
                />
              </div>
            </div>

            {/* Digital Wallet Details */}
            <div className="space-y-4">
              <h3 className="font-semibold font-poppins flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Digital Wallet Numbers
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jazzcash_number" className="font-poppins">JazzCash Number</Label>
                  <Input
                    id="jazzcash_number"
                    value={formData.jazzcash_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, jazzcash_number: e.target.value }))}
                    placeholder="03XXXXXXXXX"
                    className="font-poppins"
                  />
                </div>
                
                <div>
                  <Label htmlFor="easypaisa_number" className="font-poppins">EasyPaisa Number</Label>
                  <Input
                    id="easypaisa_number"
                    value={formData.easypaisa_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, easypaisa_number: e.target.value }))}
                    placeholder="03XXXXXXXXX"
                    className="font-poppins"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="font-poppins"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Payment Methods'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Display Current Payment Methods */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800 font-poppins">
                  Payment Methods Configured
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.bank_name && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 font-poppins">Bank Account</h4>
                    <div className="text-sm text-gray-600 space-y-1 font-poppins">
                      <p><span className="font-medium">Bank:</span> {formData.bank_name}</p>
                      <p><span className="font-medium">Account:</span> {formData.account_number}</p>
                      <p><span className="font-medium">Title:</span> {formData.account_title}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 font-poppins">Digital Wallets</h4>
                  <div className="text-sm text-gray-600 space-y-1 font-poppins">
                    {formData.jazzcash_number && (
                      <p><span className="font-medium">JazzCash:</span> {formData.jazzcash_number}</p>
                    )}
                    {formData.easypaisa_number && (
                      <p><span className="font-medium">EasyPaisa:</span> {formData.easypaisa_number}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 font-poppins">
              <p>💡 <strong>Tip:</strong> These payment details will be shown to sellers when they place orders from your shop.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSetup;
