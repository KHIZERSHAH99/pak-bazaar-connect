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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Loading payment screenshot:', paymentScreenshot);
      
      try {
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .createSignedUrl(paymentScreenshot, 3600);
        
        if (error) {
          console.error('Error creating signed URL:', error);
          
          // Handle specific error cases
          if (error.message === 'Object not found') {
            setError('Payment screenshot file is missing from storage. This may happen if the file was deleted or failed to upload properly.');
          } else {
            setError(`Failed to access payment screenshot: ${error.message}`);
          }
          setImageUrl('/placeholder.svg');
        } else if (data?.signedUrl) {
          console.log('Signed URL created:', data.signedUrl);
          setImageUrl(data.signedUrl);
        } else {
          console.error('No signed URL returned');
          setError('No signed URL returned from storage');
          setImageUrl('/placeholder.svg');
        }
      } catch (error) {
        console.error('Error loading payment screenshot:', error);
        setError(`Unexpected error: ${error}`);
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

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive mb-2">Failed to load payment screenshot</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground mt-1">File: {paymentScreenshot}</p>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Payment Screenshot"
      className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
      onError={(e) => {
        console.error('Failed to load payment screenshot image');
        setError('Image failed to load from signed URL');
        e.currentTarget.src = '/placeholder.svg';
      }}
    />
  );
};

export default PaymentScreenshot;