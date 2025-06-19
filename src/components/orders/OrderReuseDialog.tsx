
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/lib/types';
import { Calculator, RotateCcw } from 'lucide-react';

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
  const [customAmount, setCustomAmount] = useState(previousOrder.total_amount?.toString() || '');

  const handleReuseSameAmount = () => {
    onReuseOrder({
      shopId: previousOrder.shop_id,
      shopName: previousOrder.shops?.name || 'Unknown Shop',
      totalAmount: previousOrder.total_amount
    });
    onOpenChange(false);
  };

  const handleReuseCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;

    onReuseOrder({
      shopId: previousOrder.shop_id,
      shopName: previousOrder.shops?.name || 'Unknown Shop',
      totalAmount: amount
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-poppins">
            <RotateCcw className="h-5 w-5" />
            Reorder from {previousOrder.shops?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Previous Order Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Amount:</strong> Rs. {previousOrder.total_amount?.toLocaleString()}</p>
              <p><strong>Date:</strong> {new Date(previousOrder.created_at).toLocaleDateString()}</p>
              <p><strong>Payment:</strong> {previousOrder.payment_method?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleReuseSameAmount}
              className="w-full justify-start"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reorder with same amount (Rs. {previousOrder.total_amount?.toLocaleString()})
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="customAmount">Custom Amount</Label>
              <Input
                id="customAmount"
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <Button
                onClick={handleReuseCustomAmount}
                className="w-full justify-start"
                variant="outline"
                disabled={!customAmount || parseFloat(customAmount) <= 0}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Reorder with custom amount
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReuseDialog;
