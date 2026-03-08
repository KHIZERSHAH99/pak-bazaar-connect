import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RotateCcw, Clock, CheckCircle, XCircle, Package, Copy } from 'lucide-react';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-semibold font-poppins truncate">
                Order #{order.id.slice(0, 8)}
              </h3>
              <Badge className={`flex items-center gap-1 text-xs sm:text-sm ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                <span className="sm:hidden">{order.status.charAt(0).toUpperCase() + order.status.slice(1).substring(0, 3)}</span>
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs sm:text-sm text-gray-600 font-poppins">
              <div className="grid grid-cols-1 gap-2">
                <p className="truncate"><strong>Amount:</strong> Rs. {order.total_amount?.toLocaleString()}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                
                {userRole === 'wholesaler' && order.buyer_name && <p className="truncate"><strong>Buyer:</strong> {order.buyer_name}</p>}
                
                {userRole === 'seller' && order.shops?.name && <p className="truncate"><strong>Shop:</strong> {order.shops.name}</p>}
                
                {order.payment_method && <p className="truncate"><strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}</p>}
              </div>
            </div>

            {order.wholesaler_notes && <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm break-words"><strong>Notes:</strong> {order.wholesaler_notes}</p>
              </div>}
          </div>

          <div className="flex flex-row sm:flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewOrder(order)} className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            
            {showReorderButton && onReorder && <Button variant="outline" size="sm" onClick={() => onReorder(order)} className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm">
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reorder</span>
                <span className="sm:hidden">Re-order</span>
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default OrderCard;