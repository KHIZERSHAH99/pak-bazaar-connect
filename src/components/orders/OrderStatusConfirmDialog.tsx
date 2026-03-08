import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface OrderStatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  newStatus: string;
  onConfirm: (orderId: string, status: string, notes?: string) => void;
}

const statusLabels: Record<string, { label: string; description: string; variant: string }> = {
  confirmed: { label: 'Accept Order', description: 'This order will be marked as confirmed and you should begin processing it.', variant: 'default' },
  rejected: { label: 'Reject Order', description: 'This order will be rejected. Please provide a reason below.', variant: 'destructive' },
  shipped: { label: 'Mark as Shipped', description: 'Confirm that this order has been shipped to the buyer.', variant: 'default' },
  delivered: { label: 'Mark as Delivered', description: 'Confirm that this order has been delivered to the buyer.', variant: 'default' },
};

const OrderStatusConfirmDialog: React.FC<OrderStatusConfirmDialogProps> = ({
  open, onOpenChange, orderId, newStatus, onConfirm
}) => {
  const [notes, setNotes] = useState('');
  const config = statusLabels[newStatus] || { label: newStatus, description: '', variant: 'default' };

  const handleConfirm = () => {
    onConfirm(orderId, newStatus, notes || undefined);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-poppins">{config.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{config.description}</p>
          <Badge variant={newStatus === 'rejected' ? 'destructive' : 'default'}>
            Order #{orderId.slice(0, 8)}
          </Badge>
          <Textarea
            placeholder={newStatus === 'rejected' ? 'Reason for rejection (required)...' : 'Add notes (optional)...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant={newStatus === 'rejected' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={newStatus === 'rejected' && !notes.trim()}
          >
            {config.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusConfirmDialog;
