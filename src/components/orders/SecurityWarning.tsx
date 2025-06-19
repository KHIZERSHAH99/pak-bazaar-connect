
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityWarningProps {
  type: 'general' | 'verification' | 'payment';
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case 'verification':
        return {
          icon: Shield,
          title: 'Verification Required',
          message: 'Some order details are only visible after verification and confirmation.'
        };
      case 'payment':
        return {
          icon: AlertTriangle,
          title: 'Payment Security',
          message: 'Always verify payment details before processing orders. Report suspicious activity.'
        };
      default:
        return {
          icon: Shield,
          title: 'Security Notice',
          message: 'All order activities are logged for security purposes.'
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <Alert>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <strong>{content.title}:</strong> {content.message}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityWarning;
