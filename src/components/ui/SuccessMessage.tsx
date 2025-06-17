
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, className = '' }) => {
  return (
    <Alert className={`border-green-200 bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200 font-poppins ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default SuccessMessage;
