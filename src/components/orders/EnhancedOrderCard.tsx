import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  AlertTriangle,
  MapPin,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface EnhancedOrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  onReorder?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  showReorderButton?: boolean;
  userRole: 'wholesaler' | 'seller';
  showActions?: boolean;
}

const EnhancedOrderCard: React.FC<EnhancedOrderCardProps> = ({
  order,
  onViewOrder,
  onReorder,
  onStatusUpdate,
  showReorderButton = false,
  userRole,
  showActions = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'packed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <MapPin className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'returned':
        return <ArrowLeft className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus: string): OrderStatus | null => {
    const statusFlow: Record<string, OrderStatus> = {
      'pending': 'confirmed',
      'confirmed': 'processing',
      'processing': 'packed',
      'packed': 'shipped',
      'shipped': 'delivered',
      'delivered': 'completed'
    };
    return statusFlow[currentStatus] || null;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'returned': 'Returned'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority?: number) => {
    if (!priority || priority === 1) return 'text-gray-500';
    if (priority === 2) return 'text-yellow-600';
    if (priority === 3) return 'text-red-600';
    return 'text-gray-500';
  };

  const nextStatus = getNextStatus(order.status);
  const canAdvanceStatus = userRole === 'wholesaler' && nextStatus && !['completed', 'rejected', 'returned'].includes(order.status);

  return (
    <Card className={`hover:shadow-md transition-shadow overflow-hidden ${order.requires_attention ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-semibold font-poppins truncate">
                Order #{order.id.slice(0, 8)}
              </h3>
              <Badge className={`flex items-center gap-1 text-xs sm:text-sm ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="hidden sm:inline">{getStatusLabel(order.status)}</span>
                <span className="sm:hidden">{getStatusLabel(order.status).substring(0, 3)}</span>
              </Badge>
              
              {order.requires_attention && (
                <Badge variant="outline" className="flex items-center gap-1 border-yellow-400 text-yellow-700 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="hidden sm:inline">Attention</span>
                  <span className="sm:hidden">!</span>
                </Badge>
              )}
              
              {order.priority_level && order.priority_level > 1 && (
                <Badge variant="outline" className={`${getPriorityColor(order.priority_level)} text-xs`}>
                  P{order.priority_level}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-xs sm:text-sm text-gray-600 font-poppins">
              <div className="grid grid-cols-1 gap-2">
                <p className="truncate"><strong>Amount:</strong> Rs. {order.total_amount?.toLocaleString()}</p>
                <p className="truncate"><strong>Created:</strong> {formatDate(order.created_at)}</p>
                
                {userRole === 'wholesaler' && order.buyer_name && (
                  <p className="truncate"><strong>Buyer:</strong> {order.buyer_name}</p>
                )}
                
                {userRole === 'seller' && order.shops?.name && (
                  <p className="truncate"><strong>Shop:</strong> {order.shops.name}</p>
                )}
                
                {order.payment_method && (
                  <p className="truncate"><strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}</p>
                )}

                {order.tracking_number && (
                  <p className="truncate"><strong>Tracking:</strong> {order.tracking_number}</p>
                )}

                {order.carrier_name && (
                  <p className="truncate"><strong>Carrier:</strong> {order.carrier_name}</p>
                )}

                {order.estimated_delivery && (
                  <p className="flex items-center gap-1 truncate">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <strong>Est. Delivery:</strong> {formatDate(order.estimated_delivery)}
                  </p>
                )}
              </div>
            </div>

            {(order.wholesaler_notes || order.order_notes) && (
              <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                {order.wholesaler_notes && (
                  <p className="text-xs sm:text-sm break-words"><strong>Notes:</strong> {order.wholesaler_notes}</p>
                )}
                {order.order_notes && (
                  <p className="text-xs sm:text-sm break-words"><strong>Order Notes:</strong> {order.order_notes}</p>
                )}
              </div>
            )}

            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-3">
                <p className="text-xs sm:text-sm font-medium mb-1">Items ({order.order_items.length}):</p>
                <div className="space-y-1">
                  {order.order_items.slice(0, 2).map((item, index) => (
                    <p key={index} className="text-xs text-gray-600 truncate">
                      {item.quantity}x {item.product_name} - Rs. {item.total_price.toLocaleString()}
                    </p>
                  ))}
                  {order.order_items.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{order.order_items.length - 2} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm min-w-[80px]"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            
            {showReorderButton && onReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm min-w-[80px]"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reorder</span>
                <span className="sm:hidden">Re-buy</span>
              </Button>
            )}

            {canAdvanceStatus && onStatusUpdate && showActions && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStatusUpdate(order.id, nextStatus)}
                className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-xs sm:text-sm min-w-[80px]"
              >
                {getStatusIcon(nextStatus)}
                <span className="hidden sm:inline">{getStatusLabel(nextStatus)}</span>
                <span className="sm:hidden">Next</span>
              </Button>
            )}

            {userRole === 'wholesaler' && order.status === 'pending' && onStatusUpdate && showActions && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onStatusUpdate(order.id, 'rejected')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm min-w-[80px]"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reject</span>
                <span className="sm:hidden">No</span>
              </Button>
            )}
          </div>
        </div>

        {order.last_status_update && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(order.last_status_update)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderCard;