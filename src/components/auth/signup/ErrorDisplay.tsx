
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start text-red-700 text-sm border border-red-200 shadow-sm">
      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium font-poppins">Please fix the following:</p>
        <p className="font-poppins mt-1">{errorMessage}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
