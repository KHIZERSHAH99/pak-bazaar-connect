
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;

  return (
    <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center text-red-600 text-sm border border-red-100">
      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
      <span className="font-poppins">{errorMessage}</span>
    </div>
  );
};

export default ErrorDisplay;
