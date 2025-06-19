
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

interface OrderReuseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousOrder: Order;
  onReuseOrder: (orderData: any) => void;
}

const OrderReuseDialog: React.FC<OrderReuseDialogProps> = ({
  open,
  onOpenChange,
  previousOrder,
  onReuseOrder
}) => {
  const handleReuse = () => {
    const orderData = {
      shopId: previousOrder.shop_id,
      totalAmount: previousOrder.total_amount,
      paymentMethod: previousOrder.payment_method,
      buyerName: previousOrder.buyer_name,
      buyerPhone: previousOrder.buyer_phone,
      buyerAddress: previousOrder.buyer_address
    };
    onReuseOrder(orderData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reuse Previous Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Previous Order Details:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Shop:</strong> {previousOrder.shops?.name}</p>
              <p><strong>Amount:</strong> Rs. {previousOrder.total_amount?.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> {previousOrder.payment_method?.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Buyer:</strong> {previousOrder.buyer_name}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            This will create a new order with the same details. You'll need to upload a new payment screenshot.
          </p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleReuse} className="flex-1">
              Reuse Order Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReuseDialog;
