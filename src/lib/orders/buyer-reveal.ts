
import { Order } from '@/lib/types';

export interface BuyerDetailsRevealConfig {
  showBuyerDetails: boolean;
  revealMessage: string;
  canReveal: boolean;
}

export const getBuyerDetailsRevealConfig = (order: Order): BuyerDetailsRevealConfig => {
  const isPending = order.status === 'pending';
  const isConfirmedOrCompleted = ['confirmed', 'completed'].includes(order.status);
  
  return {
    showBuyerDetails: !isPending,
    revealMessage: isPending 
      ? '🔒 Buyer details will be revealed after you confirm this order'
      : '✅ Buyer details revealed after order confirmation',
    canReveal: isPending
  };
};

export const shouldShowPartialView = (order: Order): boolean => {
  return order.status === 'pending';
};

export const getOrderActionPrompt = (order: Order): string => {
  switch (order.status) {
    case 'pending':
      return 'This order requires your immediate attention. Review the payment screenshot and decide whether to confirm or reject.';
    case 'confirmed':
      return 'Order confirmed. Buyer details are now visible. Proceed with order fulfillment.';
    case 'completed':
      return 'Order completed successfully.';
    case 'rejected':
      return 'Order was rejected. No further action required.';
    default:
      return 'Order status unknown.';
  }
};
