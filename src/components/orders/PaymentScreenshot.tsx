import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
          <PaymentImage paymentScreenshot={paymentScreenshot} />
        </div>
      )}
    </div>
  );
};

const PaymentImage: React.FC<{ paymentScreenshot: string }> = ({ paymentScreenshot }) => {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.svg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .createSignedUrl(paymentScreenshot, 3600);
        
        if (error) {
          console.error('Error creating signed URL:', error);
          setImageUrl('/placeholder.svg');
        } else {
          setImageUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Error loading payment screenshot:', error);
        setImageUrl('/placeholder.svg');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [paymentScreenshot]);

  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading screenshot...</div>;
  }

  return (
    <img
      src={imageUrl}
      alt="Payment Screenshot"
      className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
      onError={(e) => {
        console.error('Failed to load payment screenshot');
        e.currentTarget.src = '/placeholder.svg';
      }}
    />
  );
};

export default PaymentScreenshot;