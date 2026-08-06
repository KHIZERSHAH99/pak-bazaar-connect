
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethodInfo } from '@/lib/types';

// Get payment methods for a wholesaler
export const getWholesalerPaymentMethods = async (wholesalerId: string): Promise<PaymentMethodInfo[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('wholesaler_id', wholesalerId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }

  return data || [];
};
