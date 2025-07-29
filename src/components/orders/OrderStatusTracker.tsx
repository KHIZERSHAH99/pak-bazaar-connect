import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  XCircle, 
  ArrowLeft 
} from 'lucide-react';
import { Order, OrderStatusHistory } from '@/lib/types';

interface OrderStatusTrackerProps {
  order: Order;
  statusHistory?: OrderStatusHistory[];
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  statusHistory = []
}) => {
  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'packed', label: 'Packed', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: MapPin },
    { status: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (['rejected', 'returned'].includes(order.status)) return -1;
    return statusSteps.findIndex(step => step.status === order.status);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    
    if (order.status === 'rejected' || order.status === 'returned') {
      return stepIndex === 0 ? 'completed' : 'pending';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return 'bg-blue-500 text-white border-blue-500';
      default:
        return 'bg-gray-200 text-gray-500 border-gray-300';
    }
  };

  const getConnectorColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-300';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepTimestamp = (status: string) => {
    switch (status) {
      case 'pending':
        return formatDate(order.created_at);
      case 'confirmed':
        return formatDate(order.confirmed_at);
      case 'processing':
        return formatDate(order.processing_started_at);
      case 'packed':
        return formatDate(order.packed_at);
      case 'shipped':
        return formatDate(order.shipped_at);
      case 'delivered':
        return formatDate(order.delivered_at);
      case 'completed':
        return formatDate(order.delivered_at);
      default:
        return null;
    }
  };

  if (order.status === 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Order Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">
              This order was rejected on {formatDate(order.rejected_at)}
            </p>
            {order.rejection_reason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Reason:</strong> {order.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (order.status === 'returned') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <ArrowLeft className="h-5 w-5" />
            Order Returned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600">
              This order was returned on {formatDate(order.returned_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const Icon = step.icon;
            const timestamp = getStepTimestamp(step.status);
            
            return (
              <div key={step.status} className="relative">
                <div className="flex items-center">
                  <div className={`
                    relative z-10 flex items-center justify-center w-10 h-10 
                    rounded-full border-2 transition-colors duration-200
                    ${getStepColor(stepStatus)}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${
                        stepStatus === 'completed' ? 'text-green-800' :
                        stepStatus === 'current' ? 'text-blue-800' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      
                      {timestamp && (
                        <Badge variant="outline" className="text-xs">
                          {timestamp}
                        </Badge>
                      )}
                    </div>
                    
                    {stepStatus === 'current' && order.tracking_number && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < statusSteps.length - 1 && (
                  <div className={`
                    absolute left-5 top-10 w-0.5 h-6 transform -translate-x-px
                    transition-colors duration-200
                    ${getConnectorColor(stepStatus)}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {order.estimated_delivery && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <strong>Estimated Delivery:</strong> {formatDate(order.estimated_delivery)}
            </p>
          </div>
        )}

        {statusHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Status History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {statusHistory.map((history, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span className="font-medium capitalize">
                      {history.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(history.created_at)}
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-gray-600 mt-1">{history.notes}</p>
                  )}
                  {history.profiles?.business_name && (
                    <p className="text-gray-500 text-xs mt-1">
                      by {history.profiles.business_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStatusTracker;