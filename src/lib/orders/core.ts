
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';

// Enhanced order creation with payment screenshot
export const createOrderWithPayment = async (
  shopId: string,
  totalAmount: number,
  paymentData: {
    method: PaymentMethod;
    screenshot: File;
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
  }
) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Get shop details to check if user is not ordering from own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .maybeSingle();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw shopError;
  }
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }

  // Upload payment screenshot
  const fileExt = paymentData.screenshot.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, paymentData.screenshot);

  if (uploadError) {
    console.error('Error uploading screenshot:', uploadError);
    throw uploadError;
  }

  // Create order with payment info
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: user.id,
      shop_id: shopId,
      total_amount: totalAmount,
      payment_method: paymentData.method,
      payment_screenshot: uploadData.path,
      buyer_name: paymentData.buyerName,
      buyer_phone: paymentData.buyerPhone,
      buyer_address: paymentData.buyerAddress,
      screenshot_uploaded_at: new Date().toISOString(),
      status: 'pending'
    }])
    .select(`
      *,
      shops(name, contact, address),
      profiles!orders_buyer_id_fkey(email)
    `)
    .maybeSingle();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to create order - no data returned');
  }
  
  return data;
};

// Confirm order (wholesaler action)
export const confirmOrder = async (orderId: string, notes?: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      wholesaler_notes: notes
    })
    .eq('id', orderId)
    .select(`
      *,
      shops!inner(owner_id)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error confirming order:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Order not found or confirmation failed');
  }

  // Verify user owns the shop
  const order = data;
  if (order.shops?.owner_id !== user.id) {
    throw new Error('Unauthorized to confirm this order');
  }

  return order;
};

// Reject order (wholesaler action)
export const rejectOrder = async (orderId: string, notes?: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      wholesaler_notes: notes
    })
    .eq('id', orderId)
    .select(`
      *,
      shops!inner(owner_id)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Order not found or rejection failed');
  }

  // Verify user owns the shop
  const order = data;
  if (order.shops?.owner_id !== user.id) {
    throw new Error('Unauthorized to reject this order');
  }

  return order;
};

// Reuse previous order
export const reusePreviousOrder = async (previousOrderId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data: previousOrder, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', previousOrderId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  if (error || !previousOrder) {
    throw new Error('Previous order not found');
  }

  return {
    shop_id: previousOrder.shop_id,
    total_amount: previousOrder.total_amount,
    payment_method: previousOrder.payment_method,
    buyer_name: previousOrder.buyer_name,
    buyer_phone: previousOrder.buyer_phone,
    buyer_address: previousOrder.buyer_address
  };
};
