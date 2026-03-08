
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { logOrderCreated, logOrderConfirmed, logOrderRejected, logPaymentScreenshotUploaded } from '@/lib/security/audit-enhanced';

// Enhanced order creation with comprehensive audit logging
export const createOrderWithPaymentEnhanced = async (
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
    .select('owner_id, name')
    .eq('id', shopId)
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw shopError;
  }
  
  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }

  // Validate file size (100KB limit)
  if (paymentData.screenshot.size > 102400) {
    throw new Error('Payment screenshot must be less than 100KB');
  }

  // Upload payment screenshot with enhanced error handling
  const fileExt = paymentData.screenshot.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, paymentData.screenshot);

  if (uploadError) {
    console.error('Error uploading screenshot:', uploadError);
    throw new Error(`Failed to upload payment screenshot: ${uploadError.message}`);
  }

  // Create order with enhanced data
  const orderData = {
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
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select(`
      *,
      shops(name, contact, address),
      profiles!orders_buyer_id_fkey(email)
    `);
  
  if (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
  
  const createdOrder = data[0];
  
  // Log audit events
  await logOrderCreated(createdOrder.id, {
    shop_name: shop.name,
    total_amount: totalAmount,
    payment_method: paymentData.method,
    buyer_name: paymentData.buyerName
  });
  
  await logPaymentScreenshotUploaded(createdOrder.id, uploadData.path);
  
  return createdOrder;
};

// Enhanced order confirmation with audit logging
export const confirmOrderEnhanced = async (orderId: string, notes?: string) => {
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
      shops!fk_orders_shop_id(owner_id, name)
    `);

  if (error) {
    console.error('Error confirming order:', error);
    throw new Error(`Failed to confirm order: ${error.message}`);
  }

  // Verify user owns the shop
  const order = data[0];
  if (order.shops?.owner_id !== user.id) {
    throw new Error('Unauthorized to confirm this order');
  }

  // Log audit event
  await logOrderConfirmed(orderId, user.id);

  return order;
};

// Enhanced order rejection with audit logging
export const rejectOrderEnhanced = async (orderId: string, notes?: string) => {
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
      shops!fk_orders_shop_id(owner_id, name)
    `);

  if (error) {
    console.error('Error rejecting order:', error);
    throw new Error(`Failed to reject order: ${error.message}`);
  }

  // Verify user owns the shop
  const order = data[0];
  if (order.shops?.owner_id !== user.id) {
    throw new Error('Unauthorized to reject this order');
  }

  // Log audit event
  await logOrderRejected(orderId, user.id, notes);

  return order;
};

// Get order with security checks
export const getOrderWithSecurity = async (orderId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shops!shop_id(name, contact, address, owner_id),
      profiles!orders_buyer_id_fkey(email, business_name)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  // Check if user has access to this order
  const isOrderOwner = data.buyer_id === user.id;
  const isShopOwner = data.shops?.owner_id === user.id;
  
  if (!isOrderOwner && !isShopOwner) {
    throw new Error('Unauthorized access to order');
  }

  return {
    ...data,
    canViewFullDetails: isShopOwner && data.status === 'confirmed'
  };
};
