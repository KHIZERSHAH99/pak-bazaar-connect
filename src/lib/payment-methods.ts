
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethodInfo } from '@/lib/types';

// Create or update payment methods for wholesaler
export const upsertPaymentMethods = async (paymentData: {
  bank_name?: string;
  account_number?: string;
  account_title?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if payment methods already exist
  const { data: existing, error: fetchError } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('wholesaler_id', user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching existing payment methods:', fetchError);
    throw fetchError;
  }

  const paymentMethodData = {
    wholesaler_id: user.id,
    ...paymentData,
    is_active: true,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('payment_methods')
      .update(paymentMethodData)
      .eq('id', existing.id)
      .select();

    if (error) {
      console.error('Error updating payment methods:', error);
      throw error;
    }

    return data[0];
  } else {
    // Create new
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([paymentMethodData])
      .select();

    if (error) {
      console.error('Error creating payment methods:', error);
      throw error;
    }

    return data[0];
  }
};

// Get payment methods for a wholesaler (public - for sellers to see)
export const getPaymentMethodsForShop = async (shopId: string): Promise<PaymentMethodInfo | null> => {
  console.log('🔍 Fetching payment methods for shop ID:', shopId);
  
  if (!shopId) {
    console.error('❌ No shop ID provided');
    return null;
  }

  try {
    // First get the shop to find the owner
    console.log('📋 Step 1: Getting shop details...');
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id, name')
      .eq('id', shopId)
      .single();

    if (shopError) {
      console.error('❌ Error fetching shop:', shopError);
      return null;
    }

    if (!shop) {
      console.error('❌ Shop not found for ID:', shopId);
      return null;
    }

    console.log('✅ Shop found:', {
      shopId,
      shopName: shop.name,
      ownerId: shop.owner_id
    });

    // Then get the payment methods for the shop owner
    console.log('📋 Step 2: Getting payment methods for owner:', shop.owner_id);
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('wholesaler_id', shop.owner_id)
      .eq('is_active', true)
      .maybeSingle();

    if (paymentError) {
      console.error('❌ Error fetching payment methods:', paymentError);
      return null;
    }

    if (!paymentMethods) {
      console.log('⚠️ No payment methods found for wholesaler:', shop.owner_id);
      return null;
    }

    console.log('✅ Payment methods found:', {
      hasBank: !!paymentMethods.bank_name,
      hasJazzCash: !!paymentMethods.jazzcash_number,
      hasEasyPaisa: !!paymentMethods.easypaisa_number,
      bankName: paymentMethods.bank_name,
      accountNumber: paymentMethods.account_number
    });

    return paymentMethods;
  } catch (error) {
    console.error('💥 Unexpected error in getPaymentMethodsForShop:', error);
    return null;
  }
};

// Get own payment methods (for wholesaler)
export const getMyPaymentMethods = async (): Promise<PaymentMethodInfo | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('wholesaler_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching my payment methods:', error);
    return null;
  }

  return data || null;
};
