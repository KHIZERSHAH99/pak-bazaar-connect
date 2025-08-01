import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/orders-enhanced';

interface OrderBulkActionsProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
  onOrdersUpdate: (updatedOrders: Order[]) => void;
  userRole: 'wholesaler' | 'seller';
}

const OrderBulkActions: React.FC<OrderBulkActionsProps> = ({
  orders,
  selectedOrders,
  onSelectionChange,
  onOrdersUpdate,
  userRole
}) => {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
  
  const handleSelectAll = () => {
    const eligibleOrders = orders.filter(order => 
      userRole === 'wholesaler' ? order.status === 'pending' : true
    );
    
    if (selectedOrders.length === eligibleOrders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(eligibleOrders.map(order => order.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      const updates: Order[] = [];
      
      for (const orderId of selectedOrders) {
        try {
          const updatedOrder = await updateOrderStatus(orderId, bulkAction as any);
          if (updatedOrder) {
            updates.push(updatedOrder);
          }
        } catch (error) {
          console.error(`Failed to update order ${orderId}:`, error);
        }
      }

      if (updates.length > 0) {
        onOrdersUpdate(updates);
        toast({
          title: "Bulk Action Completed",
          description: `Updated ${updates.length} order(s) successfully`,
          variant: "default"
        });
      }

      // Reset selections
      onSelectionChange([]);
      setBulkAction('');
      setBulkNotes('');
    } catch (error: any) {
      toast({
        title: "Bulk Action Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (userRole !== 'wholesaler') return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Bulk Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedOrders.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All Eligible Orders
            </Label>
          </div>
          
          {selectedOrders.length > 0 && (
            <Badge variant="secondary">
              {selectedOrders.length} order(s) selected
            </Badge>
          )}
        </div>

        {selectedOrders.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-action">Action</Label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">
                      <div className="flex items-center gap-2">
                        {getActionIcon('confirmed')}
                        Confirm Orders
                      </div>
                    </SelectItem>
                    <SelectItem value="processing">
                      <div className="flex items-center gap-2">
                        {getActionIcon('processing')}
                        Mark as Processing
                      </div>
                    </SelectItem>
                    <SelectItem value="packed">
                      <div className="flex items-center gap-2">
                        {getActionIcon('packed')}
                        Mark as Packed
                      </div>
                    </SelectItem>
                    <SelectItem value="shipped">
                      <div className="flex items-center gap-2">
                        {getActionIcon('shipped')}
                        Mark as Shipped
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        {getActionIcon('completed')}
                        Mark as Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        {getActionIcon('rejected')}
                        Reject Orders
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-notes">Notes (Optional)</Label>
                <Textarea
                  id="bulk-notes"
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  placeholder="Add notes for all selected orders..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? 'Processing...' : `Apply to ${selectedOrders.length} order(s)`}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  onSelectionChange([]);
                  setBulkAction('');
                  setBulkNotes('');
                }}
              >
                Clear Selection
              </Button>
            </div>

            {selectedOrdersData.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Selected Orders:</Label>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {selectedOrdersData.map(order => (
                    <div key={order.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>#{order.id.slice(0, 8)} - {order.buyer_name}</span>
                      <Badge variant="outline" className="text-xs">
                        Rs. {order.total_amount?.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderBulkActions;