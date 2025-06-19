
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityWarningProps {
  type: 'payment' | 'verification' | 'general';
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ type }) => {
  const getWarningContent = () => {
    switch (type) {
      case 'payment':
        return {
          icon: <Shield className="h-4 w-4" />,
          title: "Payment Security Notice",
          message: "Only send payment after confirming the wholesaler's identity. Never share your banking details with unauthorized parties. Always keep screenshots of your transactions."
        };
      case 'verification':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Verification Required",
          message: "This wholesaler's identity has been verified by our admin team. However, always exercise caution when making large transactions."
        };
      case 'general':
        return {
          icon: <Shield className="h-4 w-4" />,
          title: "Security Reminder",
          message: "For your safety, only order from verified wholesalers and keep records of all transactions. Report any suspicious activity immediately."
        };
    }
  };

  const { icon, title, message } = getWarningContent();

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <div className="flex items-start gap-2">
        <div className="text-yellow-600">{icon}</div>
        <div>
          <h4 className="font-semibold text-yellow-800 font-poppins">{title}</h4>
          <AlertDescription className="text-yellow-700 font-poppins text-sm mt-1">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default SecurityWarning;
