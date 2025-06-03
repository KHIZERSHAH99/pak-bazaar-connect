
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

// Mock payment methods for Pakistan until database is ready
const mockPaymentMethods: PaymentMethod[] = [
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
  },
  {
    id: '4',
    name: 'Cash on Delivery',
    type: 'cash_on_delivery',
    is_active: true,
    processing_fee: 0.0,
    min_amount: 100,
    max_amount: 100000
  }
];

// Get available payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    // Try to fetch from database first, fallback to mock data
    const { data, error } = await supabase
      .from('payment_methods' as any)
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      console.log('Using mock payment methods until database is ready');
      return mockPaymentMethods;
    }

    return data;
  } catch (error) {
    console.log('Using mock payment methods:', error);
    return mockPaymentMethods;
  }
};

// Calculate commission for a transaction
export const calculateCommission = async (userRole: string, amount: number): Promise<number> => {
  try {
    // Try database function first, fallback to fixed rate
    const { data, error } = await supabase.rpc('calculate_commission' as any, {
      user_role: userRole,
      amount: amount
    });

    if (error || data === null) {
      // Fallback to 2.5% commission
      return amount * 0.025;
    }

    return typeof data === 'number' ? data : amount * 0.025;
  } catch (error) {
    console.log('Using fallback commission calculation:', error);
    return amount * 0.025;
  }
};

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
    // Try database insert first
    const { data, error } = await supabase
      .from('transactions' as any)
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

    if (error || !data) {
      throw new Error('Database not ready, using mock transaction');
    }

    return data;
  } catch (error) {
    console.log('Creating mock transaction:', error);
    // Return mock transaction
    return {
      id: `mock-${Date.now()}`,
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount: amount,
      commission_amount: commissionAmount,
      payment_method_id: paymentMethodId,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  }
};

// Update transaction status (mock implementation)
export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  paymentReference?: string
): Promise<Transaction> => {
  try {
    const updateData: any = { 
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    };
    
    if (paymentReference) {
      updateData.payment_reference = paymentReference;
    }

    const { data, error } = await supabase
      .from('transactions' as any)
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Database not ready');
    }

    return data;
  } catch (error) {
    console.log('Mock transaction status update:', error);
    // Return mock updated transaction
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
    const { data, error } = await supabase
      .from('transactions' as any)
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

    if (error || !data) {
      throw new Error('Database not ready');
    }

    return data;
  } catch (error) {
    console.log('Using mock transactions:', error);
    // Return mock transactions
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
  }
};

// Simulate payment processing for different methods
export const processPayment = async (
  paymentMethodId: string,
  amount: number,
  transactionId: string
): Promise<{ success: boolean; reference?: string; error?: string }> => {
  try {
    // Get payment method details
    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);

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

// Get commission rates (mock implementation)
export const getCommissionRates = async () => {
  try {
    const { data, error } = await supabase
      .from('commission_rates' as any)
      .select('*');

    if (error || !data) {
      throw new Error('Database not ready');
    }

    return data;
  } catch (error) {
    console.log('Using mock commission rates:', error);
    return [
      { id: '1', role: 'wholesaler', rate: 0.025 },
      { id: '2', role: 'seller', rate: 0.025 }
    ];
  }
};
