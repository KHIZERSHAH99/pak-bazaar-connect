
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
      accountTitle: pm.account_title || '',
      accountNumber: pm.account_number_masked || pm.account_number || '',
      bankName: pm.bank_name || '',
      isActive: pm.is_active ?? true,
    }));
  } catch (error) {
    console.warn('Payment methods fetch error, using fallback:', error);
    return mockPaymentMethods;
  }
};
