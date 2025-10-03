import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethodInfo } from '@/types/enhanced-payment';

// Account suspension check (without commission references)
export const checkAccountSuspension = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended')
      .eq('id', user.id)
      .maybeSingle();

    return profile?.is_suspended || false;
  } catch (error) {
    console.error('Error checking account suspension:', error);
    return false;
  }
};

// Delivery confirmation
export const confirmOrderDelivery = async (orderId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        delivered_at: new Date().toISOString(),
        delivery_confirmed_by: user.id
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error confirming delivery:', error);
    throw error;
  }
};

// Order rejection with reason
export const rejectOrderWithReason = async (orderId: string, reason: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        wholesaler_notes: reason
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }
};

// Get wholesaler payment methods
export const getWholesalerPaymentMethods = async (wholesalerId: string): Promise<PaymentMethodInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('wholesaler_id', wholesalerId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};

// Create payment method
export const createPaymentMethod = async (paymentMethod: Partial<PaymentMethodInfo>): Promise<PaymentMethodInfo> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        ...paymentMethod,
        wholesaler_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};
