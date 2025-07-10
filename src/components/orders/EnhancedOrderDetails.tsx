
import React from 'react';
import { Order } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContextFixed';
import OrderHeader from './OrderHeader';
import OrderActions from './OrderActions';
import OrderMessaging from './OrderMessaging';
import PaymentScreenshot from './PaymentScreenshot';

interface EnhancedOrderDetailsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const EnhancedOrderDetails: React.FC<EnhancedOrderDetailsProps> = ({
  order,
  onOrderUpdate
}) => {
  const { profile } = useAuth();
  const isWholesaler = profile?.role === 'wholesaler';
  const canTakeAction = isWholesaler && order.status === 'pending';

  return (
    <div className="space-y-6">
      <OrderHeader order={order} />
      
      {order.payment_screenshot && (
        <PaymentScreenshot paymentScreenshot={order.payment_screenshot} />
      )}

      {canTakeAction && (
        <OrderActions order={order} onOrderUpdate={onOrderUpdate} />
      )}

      <OrderMessaging orderId={order.id} />
    </div>
  );
};

export default EnhancedOrderDetails;
