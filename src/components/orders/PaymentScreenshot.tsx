
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface PaymentScreenshotProps {
  paymentScreenshot: string | null;
}

const PaymentScreenshot: React.FC<PaymentScreenshotProps> = ({ paymentScreenshot }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);

  if (!paymentScreenshot) return null;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowScreenshot(!showScreenshot)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        {showScreenshot ? 'Hide' : 'View'} Payment Screenshot
      </Button>
      
      {showScreenshot && (
        <div className="mt-4 p-4 border rounded-lg">
          <img
            src={`/api/storage/${paymentScreenshot}`}
            alt="Payment Screenshot"
            className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PaymentScreenshot;
