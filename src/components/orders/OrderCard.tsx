
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { Clock, CheckCircle, XCircle, Eye, RotateCcw } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  onReorder?: (order: Order) => void;
  showReorderButton?: boolean;
  userRole: 'wholesaler' | 'seller';
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewOrder,
  onReorder,
  showReorderButton = false,
  userRole
}) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Amount:</strong> Rs. {order.total_amount?.toLocaleString()}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
              {order.shops && (
                <p><strong>Shop:</strong> {order.shops.name}</p>
              )}
              {userRole === 'wholesaler' && order.buyer_name && (
                <p><strong>Buyer:</strong> {order.buyer_name}</p>
              )}
              {order.payment_method && (
                <p><strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>

            {showReorderButton && onReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            )}
          </div>
        </div>

        {order.wholesaler_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm"><strong>Notes:</strong> {order.wholesaler_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
