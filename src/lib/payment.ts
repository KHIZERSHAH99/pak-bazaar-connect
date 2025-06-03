
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  processing_fee: number;
  min_amount: number;
  max_amount: number | null;
}

export interface Transaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_amount: number;
  payment_method_id: string;
  status: string;
  payment_reference?: string;
  created_at: string;
  completed_at?: string;
}

// Get available payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }

  return data || [];
};

// Calculate commission for a transaction
export const calculateCommission = async (userRole: string, amount: number): Promise<number> => {
  const { data, error } = await supabase
    .rpc('calculate_commission', {
      user_role: userRole,
      amount: amount
    });

  if (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }

  return data || 0;
};

// Create a new transaction
export const createTransaction = async (
  orderId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  commissionAmount: number,
  paymentMethodId: string
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount: amount,
      commission_amount: commissionAmount,
      payment_method_id: paymentMethodId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return data;
};

// Update transaction status
export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  paymentReference?: string
): Promise<Transaction> => {
  const updateData: any = { 
    status,
    ...(status === 'completed' && { completed_at: new Date().toISOString() })
  };
  
  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }

  return data;
};

// Get user transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      payment_methods (name, type),
      orders (
        shops (name),
        buyer_id,
        shop_id
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data || [];
};

// Simulate payment processing for different methods
export const processPayment = async (
  paymentMethodId: string,
  amount: number,
  transactionId: string
): Promise<{ success: boolean; reference?: string; error?: string }> => {
  try {
    // Get payment method details
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .single();

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    // Simulate different payment processing based on method type
    switch (paymentMethod.type) {
      case 'mobile_wallet':
        // Simulate JazzCash/EasyPaisa API call
        const reference = `${paymentMethod.name.toUpperCase()}-${Date.now()}`;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success/failure (90% success rate)
        if (Math.random() > 0.1) {
          await updateTransactionStatus(transactionId, 'completed', reference);
          return { success: true, reference };
        } else {
          await updateTransactionStatus(transactionId, 'failed');
          return { success: false, error: 'Payment declined by mobile wallet' };
        }

      case 'bank_transfer':
        // For bank transfers, mark as processing and wait for manual confirmation
        await updateTransactionStatus(transactionId, 'processing');
        return { 
          success: true, 
          reference: `BANK-${Date.now()}`,
        };

      case 'cash_on_delivery':
        // COD is marked as pending until delivery confirmation
        return { success: true, reference: `COD-${Date.now()}` };

      default:
        throw new Error('Unsupported payment method');
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    await updateTransactionStatus(transactionId, 'failed');
    return { success: false, error: error.message };
  }
};

// Get commission rates
export const getCommissionRates = async () => {
  const { data, error } = await supabase
    .from('commission_rates')
    .select('*');

  if (error) {
    console.error('Error fetching commission rates:', error);
    throw error;
  }

  return data || [];
};
