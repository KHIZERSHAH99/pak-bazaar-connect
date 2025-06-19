
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Edit3, Copy } from 'lucide-react';

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
  const [editedData, setEditedData] = useState({
    totalAmount: previousOrder.total_amount || 0,
    buyerName: previousOrder.buyer_name || '',
    buyerPhone: previousOrder.buyer_phone || '',
    buyerAddress: previousOrder.buyer_address || ''
  });
  const { toast } = useToast();

  const handleReuse = () => {
    if (!editedData.buyerName || !editedData.buyerPhone || !editedData.buyerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onReuseOrder({
      shopId: previousOrder.shop_id,
      shopName: previousOrder.shops?.name,
      ...editedData
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-poppins">
            <Edit3 className="h-5 w-5" />
            Reuse Order Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-poppins">
              Shop: <span className="font-medium">{previousOrder.shops?.name}</span>
            </p>
            <p className="text-sm text-gray-600 font-poppins">
              Original Order: <span className="font-mono text-xs">{previousOrder.id.slice(0, 8)}...</span>
            </p>
          </div>

          <div>
            <Label htmlFor="totalAmount">Total Amount (PKR) *</Label>
            <Input
              id="totalAmount"
              type="number"
              value={editedData.totalAmount}
              onChange={(e) => setEditedData({...editedData, totalAmount: Number(e.target.value)})}
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyerName">Full Name *</Label>
            <Input
              id="buyerName"
              value={editedData.buyerName}
              onChange={(e) => setEditedData({...editedData, buyerName: e.target.value})}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyerPhone">Phone Number *</Label>
            <Input
              id="buyerPhone"
              value={editedData.buyerPhone}
              onChange={(e) => setEditedData({...editedData, buyerPhone: e.target.value})}
              placeholder="03XX-XXXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyerAddress">Delivery Address *</Label>
            <Textarea
              id="buyerAddress"
              value={editedData.buyerAddress}
              onChange={(e) => setEditedData({...editedData, buyerAddress: e.target.value})}
              placeholder="Enter complete delivery address"
              required
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReuse}
              className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Reuse Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReuseDialog;
