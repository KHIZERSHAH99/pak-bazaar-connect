
import { PaymentMethod, Transaction } from './types';

// Mock payment methods for Pakistan until database is ready
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'JazzCash',
    type: 'mobile_wallet',
    is_active: true,
    processing_fee: 0.015,
    min_amount: 100,
    max_amount: 500000
  },
  {
    id: '2',
    name: 'EasyPaisa',
    type: 'mobile_wallet',
    is_active: true,
    processing_fee: 0.015,
    min_amount: 100,
    max_amount: 500000
  },
  {
    id: '3',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    is_active: true,
    processing_fee: 0.005,
    min_amount: 1000,
    max_amount: 10000000
  }
];

export const createMockTransaction = (
  orderId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  commissionAmount: number,
  paymentMethodId: string
): Transaction => ({
  id: `mock-${Date.now()}`,
  order_id: orderId,
  buyer_id: buyerId,
  seller_id: sellerId,
  amount: amount,
  commission_amount: commissionAmount,
  payment_method_id: paymentMethodId,
  status: 'pending',
  created_at: new Date().toISOString()
});
