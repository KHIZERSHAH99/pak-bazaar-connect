
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, CreditCard, Package } from 'lucide-react';
import { Order } from '@/lib/types';

interface PartialOrderViewProps {
  order: Order;
  onViewFullDetails: (order: Order) => void;
}

const PartialOrderView: React.FC<PartialOrderViewProps> = ({
  order,
  onViewFullDetails
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

  const showBuyerDetails = order.status !== 'pending';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-poppins">Order #{order.id.slice(0, 8)}</CardTitle>
            <p className="text-gray-600 font-poppins">
              {order.shops?.name} • {new Date(order.created_at!).toLocaleDateString()}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium font-poppins">PKR {order.total_amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Order Value</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium font-poppins">
                {order.payment_method?.replace('_', ' ').toUpperCase() || 'Bank Transfer'}
              </p>
              <p className="text-sm text-gray-600">Payment Method</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium font-poppins">
                {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Order Time</p>
            </div>
          </div>
        </div>

        {/* Buyer Details - Hidden for pending orders */}
        {showBuyerDetails && order.buyer_name && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-2 font-poppins">Buyer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><span className="font-medium">Name:</span> {order.buyer_name}</p>
              <p><span className="font-medium">Phone:</span> {order.buyer_phone}</p>
              <p className="md:col-span-2"><span className="font-medium">Address:</span> {order.buyer_address}</p>
            </div>
          </div>
        )}

        {/* Hidden buyer notice for pending orders */}
        {!showBuyerDetails && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700 font-poppins">
              🔒 Buyer details will be revealed after you confirm this order
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => onViewFullDetails(order)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {order.status === 'pending' ? 'Review Order' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartialOrderView;
