
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Package, CheckCircle, Truck } from 'lucide-react';
import { confirmOrderDelivery } from '@/lib/enhanced-payment';
import { Order } from '@/lib/types';

interface DeliveryConfirmationProps {
  order: Order;
  onDeliveryConfirmed: (orderId: string) => void;
}

const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({
  order,
  onDeliveryConfirmed
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelivery = async () => {
    setIsConfirming(true);
    try {
      await confirmOrderDelivery(order.id);
      
      toast({
        title: "Delivery Confirmed",
        description: "Thank you for confirming the delivery. The order is now complete.",
        variant: "default"
      });
      
      onDeliveryConfirmed(order.id);
    } catch (error: any) {
      toast({
        title: "Failed to Confirm Delivery",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (order.status === 'completed') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-3 text-green-600">
            <CheckCircle className="h-8 w-8" />
            <div className="text-center">
              <p className="font-semibold font-poppins">Order Delivered</p>
              <p className="text-sm text-gray-600 font-poppins">
                Confirmed on {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (order.status !== 'confirmed') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-poppins">
          <Truck className="h-5 w-5" />
          Delivery Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            Have you received your order? Please confirm delivery to complete this transaction.
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 font-poppins">
            What happens when you confirm delivery?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1 font-poppins">
            <li>• Order status will be marked as "Delivered"</li>
            <li>• Payment screenshot will be automatically deleted</li>
            <li>• Messaging with wholesaler will be disabled</li>
            <li>• Transaction will be considered complete</li>
          </ul>
        </div>

        <Button
          onClick={handleConfirmDelivery}
          disabled={isConfirming}
          className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
        >
          {isConfirming ? (
            'Confirming Delivery...'
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Order Received
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 font-poppins">
          Only confirm delivery after you have physically received your order
        </p>
      </CardContent>
    </Card>
  );
};

export default DeliveryConfirmation;
