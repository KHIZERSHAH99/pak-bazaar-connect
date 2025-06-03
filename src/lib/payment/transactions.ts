
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from './types';
import { createMockTransaction } from './mockData';

// Create a new transaction (mock implementation)
export const createTransaction = async (
  orderId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  commissionAmount: number,
  paymentMethodId: string
): Promise<Transaction> => {
  try {
    // Always use mock implementation since transactions table doesn't exist yet
    console.log('Creating mock transaction');
    return createMockTransaction(orderId, buyerId, sellerId, amount, commissionAmount, paymentMethodId);
  } catch (error) {
    console.log('Creating mock transaction:', error);
    return createMockTransaction(orderId, buyerId, sellerId, amount, commissionAmount, paymentMethodId);
  }
};

// Update transaction status (mock implementation)
export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  paymentReference?: string
): Promise<Transaction> => {
  try {
    // Always use mock implementation since transactions table doesn't exist yet
    console.log('Mock transaction status update');
    return {
      id: transactionId,
      order_id: 'mock-order',
      buyer_id: 'mock-buyer',
      seller_id: 'mock-seller',
      amount: 1000,
      commission_amount: 25,
      payment_method_id: '1',
      status: status,
      payment_reference: paymentReference,
      created_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    };
  } catch (error) {
    console.log('Mock transaction status update:', error);
    return {
      id: transactionId,
      order_id: 'mock-order',
      buyer_id: 'mock-buyer',
      seller_id: 'mock-seller',
      amount: 1000,
      commission_amount: 25,
      payment_method_id: '1',
      status: status,
      payment_reference: paymentReference,
      created_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    };
  }
};

// Get user transactions (mock implementation)
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    // Always use mock implementation since transactions table doesn't exist yet
    console.log('Using mock transactions');
    return [
      {
        id: 'mock-1',
        order_id: 'order-1',
        buyer_id: userId,
        seller_id: 'seller-1',
        amount: 5000,
        commission_amount: 125,
        payment_method_id: '1',
        status: 'completed',
        payment_reference: 'JAZZ-123456',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.log('Using mock transactions:', error);
    return [];
  }
};
