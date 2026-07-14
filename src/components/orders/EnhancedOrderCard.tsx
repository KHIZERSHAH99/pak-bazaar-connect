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
  ArrowLeft,
  Phone,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { buildWhatsappInvoiceUrl, buildTelUrl } from '@/lib/orders/whatsapp-invoice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case 'confirmed':
        return 'bg-primary/15 text-primary border-primary/30';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'packed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'shipped':
        return 'bg-primary/15 text-primary border-primary/30';
      case 'delivered':
        return 'bg-primary/20 text-primary border-primary/40';
      case 'completed':
        return 'bg-primary/20 text-primary border-primary/40';
      case 'rejected':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'returned':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
      'pending': 'Intezaar (Pending)',
      'confirmed': 'Confirm ho gaya',
      'processing': 'Tayyar ho raha',
      'packed': 'Pack ho gaya',
      'shipped': 'Bheja gaya',
      'delivered': 'Pahonch gaya',
      'completed': 'Mukammal',
      'rejected': 'Mana kar diya',
      'returned': 'Wapas'
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
  const isWholesalerPending = userRole === 'wholesaler' && order.status === 'pending' && showActions && !!onStatusUpdate;
  const telUrl = buildTelUrl(order.buyer_phone);
  const waUrl = buildWhatsappInvoiceUrl(order);

  const handleConfirmAndNotify = () => {
    if (!onStatusUpdate) return;
    onStatusUpdate(order.id, 'confirmed');
    if (waUrl) {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
            {isWholesalerPending && (
              <Button
                size="lg"
                onClick={handleConfirmAndNotify}
                className="flex-1 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-semibold gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Confirm & Notify (منظور کریں)
              </Button>
            )}

            {userRole === 'wholesaler' && telUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px] gap-1"
                aria-label="Call buyer"
              >
                <a href={telUrl}>
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              </Button>
            )}

            {userRole === 'wholesaler' && waUrl && !isWholesalerPending && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="min-h-[44px] gap-1"
                aria-label="Send WhatsApp invoice"
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
              className="min-h-[44px] flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>

            {showReorderButton && onReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order)}
                className="min-h-[44px] flex items-center justify-center gap-1 text-xs sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reorder</span>
                <span className="sm:hidden">Re-buy</span>
              </Button>
            )}

            {userRole === 'wholesaler' && showActions && onStatusUpdate && (canAdvanceStatus || order.status === 'pending') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canAdvanceStatus && !isWholesalerPending && (
                    <DropdownMenuItem onClick={() => onStatusUpdate(order.id, nextStatus!)}>
                      {getStatusIcon(nextStatus!)}
                      <span className="ml-2">Next: {getStatusLabel(nextStatus!)}</span>
                    </DropdownMenuItem>
                  )}
                  {order.status === 'pending' && (
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(order.id, 'rejected')}
                      className="text-destructive focus:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject (مسترد کریں)
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {order.last_status_update && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(order.last_status_update)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderCard;