
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { Order } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PaymentScreenshot from '@/components/orders/PaymentScreenshot';
import OrderConfirmationActions from '@/components/orders/OrderConfirmationActions';
import OrderRejectionForm from '@/components/orders/OrderRejectionForm';

interface PartialOrderViewProps {
  order: Order;
  onViewFullDetails: (order: Order) => void;
}

const PartialOrderView: React.FC<PartialOrderViewProps> = ({
  order,
  onViewFullDetails
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pending Review', color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, text: 'Confirmed', color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, text: 'Rejected', color: 'text-red-600' },
      completed: { variant: 'default' as const, text: 'Delivered', color: 'text-blue-600' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.text}
      </Badge>
    );
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    // Refresh the parent component
    window.location.reload();
  };

  const handleOrderRejected = (orderId: string) => {
    setShowRejectForm(false);
    setShowActions(false);
    // Refresh the parent component
    window.location.reload();
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-poppins">Order #{order.id.slice(0, 8)}</h3>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-poppins">PKR {order.total_amount?.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-poppins">
                    {new Date(order.created_at!).toLocaleDateString()}
                  </span>
                </div>
                
                {order.payment_method && (
                  <div className="font-poppins">
                    <span className="font-medium">Payment:</span> {order.payment_method.replace('_', ' ').toUpperCase()}
                  </div>
                )}
                
                {order.screenshot_uploaded_at && (
                  <div className="font-poppins">
                    <span className="font-medium">Screenshot:</span> ✅ Uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(true)}
                className="font-poppins"
              >
                <Eye className="h-4 w-4 mr-2" />
                Review
              </Button>
              
              {order.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => setShowActions(true)}
                    className="font-poppins"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    className="font-poppins"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Limited Information Display */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 font-poppins">Available Information:</h4>
            <div className="text-sm text-gray-600 space-y-1 font-poppins">
              <p>• Order Amount: PKR {order.total_amount?.toLocaleString()}</p>
              <p>• Payment Method: {order.payment_method?.replace('_', ' ').toUpperCase()}</p>
              <p>• Order Date: {new Date(order.created_at!).toLocaleDateString()}</p>
              {order.payment_screenshot && <p>• Payment Screenshot: Available for review</p>}
            </div>
            
            {order.status === 'pending' && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-700 font-poppins">
                  <strong>Privacy Protection:</strong> Buyer contact details will be revealed only after you confirm this order.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Actions Dialog */}
      <Dialog open={showActions} onOpenChange={setShowActions}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              Order #{order.id.slice(0, 8)} - Review & Actions
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Screenshot */}
            {order.payment_screenshot && (
              <PaymentScreenshot paymentScreenshot={order.payment_screenshot} />
            )}

            {/* Order Confirmation Actions */}
            <OrderConfirmationActions
              order={order}
              onOrderUpdate={handleOrderUpdate}
              onBuyerDetailsRevealed={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Rejection Dialog */}
      <Dialog open={showRejectForm} onOpenChange={setShowRejectForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              Reject Order #{order.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          <OrderRejectionForm
            order={order}
            onOrderRejected={handleOrderRejected}
            onCancel={() => setShowRejectForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartialOrderView;
