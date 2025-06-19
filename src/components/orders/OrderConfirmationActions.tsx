
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { confirmOrder, rejectOrder } from '@/lib/orders-enhanced';
import { Order } from '@/lib/types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface OrderConfirmationActionsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
  onBuyerDetailsRevealed?: () => void;
}

const OrderConfirmationActions: React.FC<OrderConfirmationActionsProps> = ({
  order,
  onOrderUpdate,
  onBuyerDetailsRevealed
}) => {
  const [wholesalerNotes, setWholesalerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'reject' | null>(null);
  const { toast } = useToast();

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const updatedOrderData = await confirmOrder(order.id, wholesalerNotes);
      
      // Create updated order object with proper typing
      const updatedOrder: Order = {
        ...order,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        wholesaler_notes: wholesalerNotes
      };
      
      onOrderUpdate(updatedOrder);
      onBuyerDetailsRevealed?.();
      
      toast({
        title: "Order Confirmed Successfully",
        description: "The buyer details are now visible and the buyer has been notified.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Failed to Confirm Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setActionType(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!wholesalerNotes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this order",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedOrderData = await rejectOrder(order.id, wholesalerNotes);
      
      // Create updated order object with proper typing
      const updatedOrder: Order = {
        ...order,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        wholesaler_notes: wholesalerNotes
      };
      
      onOrderUpdate(updatedOrder);
      
      toast({
        title: "Order Rejected",
        description: "The order has been rejected and the buyer has been notified.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Failed to Reject Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setActionType(null);
    }
  };

  const initiateAction = (type: 'confirm' | 'reject') => {
    setActionType(type);
    setShowConfirmation(true);
  };

  const executeAction = () => {
    if (actionType === 'confirm') {
      handleConfirmOrder();
    } else if (actionType === 'reject') {
      handleRejectOrder();
    }
  };

  if (order.status !== 'pending') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-poppins">
          <AlertTriangle className="h-5 w-5" />
          Order Decision Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 font-poppins">
            <strong>Important:</strong> Once you confirm this order, the buyer's contact details will be revealed 
            and you'll be committed to fulfilling the order. Please review the payment screenshot carefully.
          </AlertDescription>
        </Alert>

        {!showConfirmation ? (
          <>
            <div>
              <Label htmlFor="wholesalerNotes">Notes (Optional for confirmation, Required for rejection)</Label>
              <Textarea
                id="wholesalerNotes"
                value={wholesalerNotes}
                onChange={(e) => setWholesalerNotes(e.target.value)}
                placeholder="Add any notes about this order..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => initiateAction('reject')}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Order
              </Button>
              <Button
                onClick={() => initiateAction('confirm')}
                disabled={isSubmitting}
                className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Order
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Alert className={actionType === 'confirm' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={`font-poppins ${actionType === 'confirm' ? 'text-green-700' : 'text-red-700'}`}>
                Are you sure you want to {actionType} this order?
                {actionType === 'confirm' && ' This action will reveal buyer details and commit you to fulfilling the order.'}
                {actionType === 'reject' && wholesalerNotes && ` Reason: "${wholesalerNotes}"`}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={executeAction}
                disabled={isSubmitting}
                className={`flex-1 ${
                  actionType === 'confirm' 
                    ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : `${actionType === 'confirm' ? 'Confirm' : 'Reject'} Order`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderConfirmationActions;
