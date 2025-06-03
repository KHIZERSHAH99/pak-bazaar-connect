
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from './types';
import { mockPaymentMethods } from './mockData';

// Get available payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    // Always return mock data since payment_methods table doesn't exist yet
    console.log('Using mock payment methods until database is ready');
    return mockPaymentMethods;
  } catch (error) {
    console.log('Using mock payment methods:', error);
    return mockPaymentMethods;
  }
};
