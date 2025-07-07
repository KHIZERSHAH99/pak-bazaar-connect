
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethodInfo, OrderFormData, CommissionSettings, MonthlyCommission } from '@/types/enhanced-payment';

// Payment Methods Management
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
    throw error;
  }
};

export const createPaymentMethod = async (paymentData: Omit<PaymentMethodInfo, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethodInfo> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Enhanced Order Creation with Form Pre-filling
export const createEnhancedOrder = async (
  shopId: string,
  orderData: OrderFormData
): Promise<any> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is not ordering from own shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .single();

    if (shopError) throw shopError;
    if (shop.owner_id === user.id) {
      throw new Error('You cannot order from your own shop');
    }

    // Upload payment screenshot
    const fileExt = orderData.paymentScreenshot?.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, orderData.paymentScreenshot!);

    if (uploadError) throw uploadError;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: user.id,
        shop_id: shopId,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_screenshot: uploadData.path,
        buyer_name: orderData.buyerName,
        buyer_phone: orderData.buyerPhone,
        buyer_address: orderData.buyerAddress,
        screenshot_uploaded_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Save order data for pre-filling next time
    const lastOrderData = {
      buyerName: orderData.buyerName,
      buyerPhone: orderData.buyerPhone,
      buyerAddress: orderData.buyerAddress,
      paymentMethod: orderData.paymentMethod
    };

    await supabase
      .from('profiles')
      .update({ last_order_data: lastOrderData })
      .eq('id', user.id);

    return order;
  } catch (error) {
    console.error('Error creating enhanced order:', error);
    throw error;
  }
};

// Commission Management
export const getCommissionSettings = async (): Promise<CommissionSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('commission_settings')
      .select('*')
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    return null;
  }
};

export const updateCommissionSettings = async (percentage: number): Promise<CommissionSettings> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('commission_settings')
      .insert([{
        commission_percentage: percentage,
        effective_from: new Date().toISOString().split('T')[0],
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating commission settings:', error);
    throw error;
  }
};

export const getMonthlyCommissions = async (wholesalerId?: string): Promise<MonthlyCommission[]> => {
  try {
    let query = supabase
      .from('monthly_commissions')
      .select('*')
      .order('month', { ascending: false });

    if (wholesalerId) {
      query = query.eq('wholesaler_id', wholesalerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Cast the data to proper types
    const typedCommissions: MonthlyCommission[] = (data || []).map((item: any) => ({
      ...item,
      payment_status: item.payment_status as 'unpaid' | 'paid' | 'overdue'
    }));
    
    return typedCommissions;
  } catch (error) {
    console.error('Error fetching monthly commissions:', error);
    throw error;
  }
};

export const markCommissionPaid = async (commissionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('monthly_commissions')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', commissionId);

    if (error) throw error;

    // Update wholesaler's last payment date
    const { data: commission } = await supabase
      .from('monthly_commissions')
      .select('wholesaler_id')
      .eq('id', commissionId)
      .single();

    if (commission) {
      await supabase
        .from('profiles')
        .update({
          last_commission_payment: new Date().toISOString(),
          is_suspended: false,
          suspension_type: null,
          suspension_reason: null
        })
        .eq('id', commission.wholesaler_id);
    }
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    throw error;
  }
};

// Suspension Management
export const checkAccountSuspension = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_suspended, suspension_reason')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile?.is_suspended || false;
  } catch (error) {
    console.error('Error checking account suspension:', error);
    return false;
  }
};

// Order Management Enhancements
export const confirmOrderDelivery = async (orderId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        delivery_confirmed_by: user.id
      })
      .eq('id', orderId)
      .eq('buyer_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error confirming delivery:', error);
    throw error;
  }
};

export const rejectOrderWithReason = async (orderId: string, reason: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    // Create notification for buyer
    const { data: order } = await supabase
      .from('orders')
      .select('buyer_id')
      .eq('id', orderId)
      .single();

    if (order) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: order.buyer_id,
          title: 'Order Rejected',
          message: `Your order has been rejected. Reason: ${reason}`,
          type: 'order_status'
        }]);
    }
  } catch (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }
};
