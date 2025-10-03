
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { XCircle, AlertTriangle } from 'lucide-react';
import { rejectOrderWithReason } from '@/lib/payment-helpers';
import { Order } from '@/lib/types';

interface OrderRejectionFormProps {
  order: Order;
  onOrderRejected: (orderId: string) => void;
  onCancel: () => void;
}

const OrderRejectionForm: React.FC<OrderRejectionFormProps> = ({
  order,
  onOrderRejected,
  onCancel
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this order",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectOrderWithReason(order.id, rejectionReason);
      
      toast({
        title: "Order Rejected",
        description: "The order has been rejected and the buyer has been notified",
        variant: "default"
      });
      
      onOrderRejected(order.id);
    } catch (error: any) {
      toast({
        title: "Failed to Reject Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 font-poppins">
          <XCircle className="h-5 w-5" />
          Reject Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            <strong>Warning:</strong> Rejecting this order will permanently remove it from your dashboard
            and notify the buyer. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="rejectionReason" className="font-poppins">
            Reason for Rejection <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why you're rejecting this order (e.g., product out of stock, payment issue, etc.)"
            className="font-poppins"
            rows={4}
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2 font-poppins">
            Order Summary
          </h4>
          <div className="text-sm text-gray-600 space-y-1 font-poppins">
            <p><strong>Order ID:</strong> #{order.id.slice(0, 8)}</p>
            <p><strong>Amount:</strong> PKR {order.total_amount?.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {order.payment_method?.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Buyer:</strong> {order.buyer_name || 'Anonymous'}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 font-poppins"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            className="flex-1 font-poppins"
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting ? (
              'Rejecting Order...'
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Order
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderRejectionForm;
