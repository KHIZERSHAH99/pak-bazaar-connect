
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  CreditCard, 
  Banknote, 
  Building2,
  CheckCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  processingFee: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string | null;
  onSelectMethod: (methodId: string) => void;
  amount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
  amount
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile_wallet':
        return <Smartphone className="h-6 w-6" />;
      case 'bank_transfer':
        return <Building2 className="h-6 w-6" />;
      case 'cash_on_delivery':
        return <Banknote className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getColorScheme = (name: string) => {
    switch (name.toLowerCase()) {
      case 'jazzcash':
        return 'from-orange-500 to-red-500';
      case 'easypaisa':
        return 'from-green-500 to-teal-500';
      case 'bank transfer':
        return 'from-blue-500 to-indigo-500';
      case 'cash on delivery':
        return 'from-gray-600 to-gray-700';
      default:
        return 'from-primary to-primary/80';
    }
  };

  const filteredMethods = paymentMethods.filter(method => 
    method.isActive && 
    amount >= method.minAmount && 
    (method.maxAmount === null || amount <= method.maxAmount)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-poppins mb-4">
        Select Payment Method
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMethods.map((method) => (
          <Card
            key={method.id}
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedMethod === method.id
                ? 'ring-2 ring-pakistani_green-500 bg-pakistani_green-50'
                : 'hover:border-pakistani_green-300'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`bg-gradient-to-r ${getColorScheme(method.name)} p-2 rounded-lg mr-3`}>
                  <div className="text-white">{getIcon(method.type)}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 font-poppins">{method.name}</h4>
                  <p className="text-sm text-gray-600 font-poppins capitalize">
                    {method.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              {selectedMethod === method.id && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-600 font-poppins">
                Fee: {(method.processingFee * 100).toFixed(1)}%
              </div>
              {method.processingFee > 0 && (
                <Badge variant="outline" className="text-xs font-poppins">
                  +PKR {(amount * method.processingFee).toFixed(2)}
                </Badge>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500 font-poppins">
              Range: PKR {method.minAmount.toLocaleString()} - {method.maxAmount ? `PKR ${method.maxAmount.toLocaleString()}` : 'No limit'}
            </div>
          </Card>
        ))}
      </div>
      
      {filteredMethods.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-600 font-poppins">
            No payment methods available for this amount. Please adjust your order total.
          </p>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
