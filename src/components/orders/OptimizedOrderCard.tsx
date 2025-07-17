
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Order } from '@/lib/types';

interface OptimizedOrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  onReorder?: (order: Order) => void;
  showReorderButton?: boolean;
  userRole: 'seller' | 'wholesaler';
  onConfirm?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

const OptimizedOrderCard: React.FC<OptimizedOrderCardProps> = ({
  order,
  onViewOrder,
  onReorder,
  showReorderButton = false,
  userRole,
  onConfirm,
  onReject
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delivered':
      case 'completed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
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
      case 'delivered':
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-lg font-poppins">
                Order #{order.id.slice(0, 8)}
              </h3>
              <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {userRole === 'seller' && order.shops && (
                <p className="font-poppins">
                  <span className="font-medium">Shop:</span> {order.shops.name}
                </p>
              )}
              {userRole === 'wholesaler' && order.buyer_name && (
                <p className="font-poppins">
                  <span className="font-medium">Buyer:</span> {order.buyer_name}
                </p>
              )}
              <p className="font-poppins">
                <span className="font-medium">Amount:</span> PKR {order.total_amount?.toLocaleString()}
              </p>
              <p className="font-poppins">
                <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
              </p>
              {order.payment_method && (
                <p className="font-poppins">
                  <span className="font-medium">Payment:</span> {order.payment_method.replace('_', ' ').toUpperCase()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            
            {userRole === 'wholesaler' && order.status === 'pending' && onConfirm && onReject && (
              <>
                <Button
                  size="sm"
                  onClick={() => onConfirm(order.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(order.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            
            {showReorderButton && onReorder && order.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order)}
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                <Package className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedOrderCard;
