
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Phone, Store, Eye, Repeat } from 'lucide-react';
import { Order } from '@/lib/types';

interface OrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  onReorder?: (order: Order) => void;
  showReorderButton?: boolean;
  userRole?: 'wholesaler' | 'seller';
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewOrder,
  onReorder,
  showReorderButton = false,
  userRole = 'wholesaler'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg font-poppins">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-gray-600 font-poppins">
              {userRole === 'wholesaler' ? order.shops?.name || 'Unknown Shop' : order.shops?.name}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {userRole === 'wholesaler' ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium font-poppins">{order.buyer_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Buyer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium font-poppins">{order.buyer_phone || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Contact</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium font-poppins">{order.shops?.name}</p>
                <p className="text-sm text-gray-600">Wholesaler</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium font-poppins">
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Order Date</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pakistani_green-600 font-poppins">
              PKR {order.total_amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {showReorderButton && onReorder && (order.status === 'completed' || order.status === 'confirmed') && (
            <Button
              onClick={() => onReorder(order)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Repeat className="h-4 w-4" />
              Reorder
            </Button>
          )}
          <Button
            onClick={() => onViewOrder(order)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
