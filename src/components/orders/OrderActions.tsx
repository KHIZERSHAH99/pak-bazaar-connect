
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { confirmOrder, rejectOrder } from '@/lib/orders/core';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OrderActionsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, onOrderUpdate }) => {
  const [wholesalerNotes, setWholesalerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const updatedOrderData = await confirmOrder(order.id, wholesalerNotes);
      // Cast and ensure proper typing
      const typedOrder: Order = {
        id: updatedOrderData.id || order.id,
        buyer_id: updatedOrderData.buyer_id || order.buyer_id,
        shop_id: updatedOrderData.shop_id || order.shop_id,
        total_amount: updatedOrderData.total_amount || order.total_amount,
        status: updatedOrderData.status as OrderStatus,
        payment_method: (updatedOrderData.payment_method || order.payment_method) as PaymentMethod,
        buyer_name: updatedOrderData.buyer_name || order.buyer_name,
        buyer_phone: updatedOrderData.buyer_phone || order.buyer_phone,
        buyer_address: updatedOrderData.buyer_address || order.buyer_address,
        payment_screenshot: updatedOrderData.payment_screenshot || order.payment_screenshot,
        screenshot_uploaded_at: updatedOrderData.screenshot_uploaded_at || order.screenshot_uploaded_at,
        created_at: updatedOrderData.created_at || order.created_at,
        confirmed_at: updatedOrderData.confirmed_at || order.confirmed_at,
        rejected_at: updatedOrderData.rejected_at || order.rejected_at,
        wholesaler_notes: updatedOrderData.wholesaler_notes || order.wholesaler_notes,
        shops: order.shops ? {
          id: order.shops.id,
          name: order.shops.name,
          contact: order.shops.contact,
          address: order.shops.address,
          postal_code: order.shops.postal_code,
          owner_id: order.shops.owner_id
        } : undefined
      };
      onOrderUpdate(typedOrder);
      toast({
        title: "Order Confirmed",
        description: "The order has been confirmed successfully",
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
      // Cast and ensure proper typing
      const typedOrder: Order = {
        id: updatedOrderData.id || order.id,
        buyer_id: updatedOrderData.buyer_id || order.buyer_id,
        shop_id: updatedOrderData.shop_id || order.shop_id,
        total_amount: updatedOrderData.total_amount || order.total_amount,
        status: updatedOrderData.status as OrderStatus,
        payment_method: (updatedOrderData.payment_method || order.payment_method) as PaymentMethod,
        buyer_name: updatedOrderData.buyer_name || order.buyer_name,
        buyer_phone: updatedOrderData.buyer_phone || order.buyer_phone,
        buyer_address: updatedOrderData.buyer_address || order.buyer_address,
        payment_screenshot: updatedOrderData.payment_screenshot || order.payment_screenshot,
        screenshot_uploaded_at: updatedOrderData.screenshot_uploaded_at || order.screenshot_uploaded_at,
        created_at: updatedOrderData.created_at || order.created_at,
        confirmed_at: updatedOrderData.confirmed_at || order.confirmed_at,
        rejected_at: updatedOrderData.rejected_at || order.rejected_at,
        wholesaler_notes: updatedOrderData.wholesaler_notes || order.wholesaler_notes,
        shops: order.shops ? {
          id: order.shops.id,
          name: order.shops.name,
          contact: order.shops.contact,
          address: order.shops.address,
          postal_code: order.shops.postal_code,
          owner_id: order.shops.owner_id
        } : undefined
      };
      onOrderUpdate(typedOrder);
      toast({
        title: "Order Rejected",
        description: "The order has been rejected",
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Order Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="wholesalerNotes">Notes (Optional for confirmation, Required for rejection)</Label>
          <Textarea
            id="wholesalerNotes"
            value={wholesalerNotes}
            onChange={(e) => setWholesalerNotes(e.target.value)}
            placeholder="Add any notes about this order..."
            className="mt-1"
          />
        </div>
        
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Reject Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The buyer will be notified that their order has been rejected.
                  {!wholesalerNotes.trim() && (
                    <span className="block mt-2 text-destructive font-medium">Please add a rejection reason in the notes field first.</span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRejectOrder}
                  disabled={!wholesalerNotes.trim()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reject Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderActions;
