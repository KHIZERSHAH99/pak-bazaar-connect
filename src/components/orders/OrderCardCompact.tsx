import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Package, RotateCcw, Download, History, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardCompactProps {
  order: any;
  onStatusUpdate: (orderId: string, status: string) => void;
  onReorder: (orderId: string) => void;
  onDownloadReceipt: (order: any) => void;
  onViewTimeline: (orderId: string) => void;
  onHide?: (orderId: string) => void;
  userRole: 'seller' | 'wholesaler';
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const OrderCardCompact: React.FC<OrderCardCompactProps> = memo(({
  order, onStatusUpdate, onReorder, onDownloadReceipt, onViewTimeline, onHide, userRole
}) => {
  const showReorder = userRole === 'seller' && ['completed', 'delivered'].includes(order.status);
  const canHide =
    userRole === 'seller' &&
    !!onHide &&
    ['completed', 'delivered', 'rejected', 'cancelled'].includes(order.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{order.shops?.name || 'Order'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <Badge className={statusColorMap[order.status] || 'bg-muted text-muted-foreground'}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">Rs. {Number(order.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer:</span>
            <span>{order.buyer_name || order.profiles?.business_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
          </div>

          {order.order_notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Notes:</p>
              <p className="text-sm">{order.order_notes}</p>
            </div>
          )}

          {/* Wholesaler actions */}
          {userRole === 'wholesaler' && order.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => onStatusUpdate(order.id, 'confirmed')} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onStatusUpdate(order.id, 'rejected')} className="flex-1">
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}

          {userRole === 'wholesaler' && order.status === 'confirmed' && (
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={() => onStatusUpdate(order.id, 'shipped')} className="w-full">
                <Package className="h-4 w-4 mr-1" /> Mark as Shipped
              </Button>
            </div>
          )}

          {userRole === 'wholesaler' && order.status === 'shipped' && (
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={() => onStatusUpdate(order.id, 'delivered')} className="w-full">
                <CheckCircle className="h-4 w-4 mr-1" /> Mark as Delivered
              </Button>
            </div>
          )}

          {showReorder && (
            <div className="pt-2 border-t mt-2">
              <Button size="sm" variant="outline" onClick={() => onReorder(order.id)} className="w-full">
                <RotateCcw className="h-4 w-4 mr-1" /> Reorder
              </Button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={() => onDownloadReceipt(order)} className="flex-1 text-xs">
              <Download className="h-3 w-3 mr-1" /> Receipt
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onViewTimeline(order.id)} className="flex-1 text-xs">
              <History className="h-3 w-3 mr-1" /> Timeline
            </Button>
            {canHide && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onHide!(order.id)}
                className="text-xs text-destructive hover:text-destructive"
                aria-label="Remove order from my list"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OrderCardCompact.displayName = 'OrderCardCompact';
export default OrderCardCompact;
