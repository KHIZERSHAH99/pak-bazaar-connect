
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod, PaymentMethodInfo, OrderMessage, WholesalerMonthlySales } from '@/lib/types';

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
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw shopError;
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
    `);
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data[0];
};

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
    `);

  if (error) {
    console.error('Error confirming order:', error);
    throw error;
  }

  // Verify user owns the shop
  const order = data[0];
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
    `);

  if (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }

  // Verify user owns the shop
  const order = data[0];
  if (order.shops?.owner_id !== user.id) {
    throw new Error('Unauthorized to reject this order');
  }

  return order;
};

// Get orders for wholesaler with simplified return type
export const getWholesalerOrders = async (showFullDetails: boolean = false) => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get shop IDs for the wholesaler
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (shopsError || !shops.length) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }

  const shopIds = shops.map(shop => shop.id);

  // Select fields based on whether to show full details
  const selectFields = showFullDetails 
    ? `
      id,
      buyer_id,
      shop_id,
      total_amount,
      status,
      payment_method,
      buyer_name,
      buyer_phone,
      buyer_address,
      payment_screenshot,
      screenshot_uploaded_at,
      created_at,
      confirmed_at,
      rejected_at,
      wholesaler_notes,
      commission_id,
      shops(id, name, contact, address, postal_code, owner_id),
      profiles!orders_buyer_id_fkey(id, email, role, business_name)
    `
    : `
      id,
      buyer_id,
      shop_id,
      buyer_name,
      buyer_phone,
      total_amount,
      status,
      payment_method,
      payment_screenshot,
      screenshot_uploaded_at,
      created_at,
      confirmed_at,
      rejected_at,
      wholesaler_notes,
      commission_id,
      shops(id, name, postal_code, contact, address, owner_id)
    `;

  const { data, error } = await supabase
    .from('orders')
    .select(selectFields)
    .in('shop_id', shopIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
};

// Get seller orders with simplified return type
export const getSellerOrders = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shops(id, name, contact, address, postal_code, owner_id),
      profiles!orders_buyer_id_fkey(email)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller orders:', error);
    return [];
  }

  return data || [];
};

// Get wholesaler monthly sales
export const getWholesalerMonthlySales = async (month?: string): Promise<WholesalerMonthlySales> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const targetDate = month ? new Date(month) : new Date();
  
  const { data, error } = await supabase
    .rpc('get_wholesaler_monthly_sales', {
      wholesaler_uuid: user.id,
      target_month: targetDate.toISOString().split('T')[0]
    });

  if (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }

  return data[0] || {
    total_orders: 0,
    total_sales: 0,
    pending_commission: 0,
    paid_commission: 0
  };
};

// Send order message
export const sendOrderMessage = async (orderId: string, message: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('order_messages')
    .insert([{
      order_id: orderId,
      sender_id: user.id,
      message
    }])
    .select(`
      *,
      profiles(id, email, role, business_name)
    `);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return {
    ...data[0],
    profiles: data[0].profiles ? {
      ...data[0].profiles,
      role: data[0].profiles.role as any
    } : undefined
  };
};

// Get order messages
export const getOrderMessages = async (orderId: string): Promise<OrderMessage[]> => {
  const { data, error } = await supabase
    .from('order_messages')
    .select(`
      *,
      profiles(id, email, role, business_name)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map(message => ({
    ...message,
    profiles: message.profiles ? {
      ...message.profiles,
      role: message.profiles.role as any
    } : undefined
  }));
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
    .single();

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
