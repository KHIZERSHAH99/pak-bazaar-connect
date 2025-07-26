
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentScreenshotProps {
  paymentScreenshot: string | null;
}

const PaymentScreenshot: React.FC<PaymentScreenshotProps> = ({ paymentScreenshot }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);

  if (!paymentScreenshot) return null;

  // Get the correct Supabase storage URL
  const { data } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(paymentScreenshot);

  // Construct the full URL
  const imageUrl = data.publicUrl;

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
            src={imageUrl}
            alt="Payment Screenshot"
            className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
            onError={(e) => {
              console.error('Failed to load payment screenshot:', imageUrl);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentScreenshot;
