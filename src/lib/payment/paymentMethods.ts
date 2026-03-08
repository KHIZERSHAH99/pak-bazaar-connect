
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from './types';
import { mockPaymentMethods } from './mockData';

// Get available payment methods from database
export const getPaymentMethods = async (wholesalerId?: string): Promise<PaymentMethod[]> => {
  try {
    let query = supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);
    
    if (wholesalerId) {
      query = query.eq('wholesaler_id', wholesalerId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.warn('Failed to fetch payment methods, using fallback:', error.message);
      return mockPaymentMethods;
    }
    
    if (!data || data.length === 0) {
      return mockPaymentMethods;
    }
    
    return data.map(pm => ({
      id: pm.id,
      name: pm.bank_name || 'Bank Transfer',
      type: pm.jazzcash_number ? 'jazzcash' : pm.easypaisa_number ? 'easypaisa' : 'bank_transfer',
      is_active: pm.is_active ?? true,
      processing_fee: 0,
      min_amount: 0,
      max_amount: null,
    }));
  } catch (error) {
    console.warn('Payment methods fetch error, using fallback:', error);
    return mockPaymentMethods;
  }
};
