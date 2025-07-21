
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethod } from '@/lib/types';

export const createOrderWithPayment = async (
  shopId: string,
  totalAmount: number,
  paymentMethod: PaymentMethod,
  paymentScreenshot: File,
  buyerInfo?: {
    buyer_name: string;
    buyer_phone: string;
    buyer_address: string;
  }
) => {
  console.log('Creating order with payment:', {
    shopId,
    totalAmount,
    paymentMethod,
    buyerInfo,
    hasScreenshot: !!paymentScreenshot
  });

  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // First upload the payment screenshot
    console.log('Uploading payment screenshot...');
    const fileName = `payment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${paymentScreenshot.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, paymentScreenshot, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading payment screenshot:', uploadError);
      throw new Error('Failed to upload payment screenshot');
    }

    console.log('Payment screenshot uploaded successfully:', uploadData);

    // Create the order
    const orderData = {
      buyer_id: user.id,
      shop_id: shopId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_screenshot: uploadData.path,
      buyer_name: buyerInfo?.buyer_name || '',
      buyer_phone: buyerInfo?.buyer_phone || '',
      buyer_address: buyerInfo?.buyer_address || '',
      screenshot_uploaded_at: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Creating order with data:', orderData);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Try to clean up the uploaded file
      await supabase.storage
        .from('payment-screenshots')
        .remove([uploadData.path]);
      throw new Error('Failed to create order');
    }

    console.log('Order created successfully:', order);
    return order;
  } catch (error) {
    console.error('Error in createOrderWithPayment:', error);
    throw error;
  }
};

export const getOrdersByBuyer = async (buyerId: string) => {
  console.log('Fetching orders for buyer:', buyerId);
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shops (
        id,
        name,
        contact,
        address,
        owner_id
      )
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching buyer orders:', error);
    throw error;
  }

  console.log('Buyer orders fetched:', data);
  return data;
};

export const getOrdersByShop = async (shopId: string) => {
  console.log('Fetching orders for shop:', shopId);
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        id,
        email,
        contact_name,
        phone_number
      )
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shop orders:', error);
    throw error;
  }

  console.log('Shop orders fetched:', data);
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'confirmed' | 'rejected' | 'completed',
  notes?: string
) => {
  console.log('Updating order status:', { orderId, status, notes });
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === 'rejected') {
    updateData.rejected_at = new Date().toISOString();
    updateData.rejection_reason = notes;
  } else if (status === 'completed') {
    updateData.delivered_at = new Date().toISOString();
  }

  if (notes) {
    updateData.wholesaler_notes = notes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  console.log('Order status updated successfully:', data);
  return data;
};

export const getSellerOrders = async (sellerId: string) => {
  console.log('Fetching orders for seller:', sellerId);
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shops (
        id,
        name,
        contact,
        address,
        owner_id
      )
    `)
    .eq('buyer_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }

  console.log('Seller orders fetched:', data);
  return data;
};

export const getWholesalerOrders = async (wholesalerId: string) => {
  console.log('Fetching orders for wholesaler:', wholesalerId);
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        id,
        email,
        contact_name,
        phone_number
      ),
      shops!inner (
        id,
        name,
        owner_id
      )
    `)
    .eq('shops.owner_id', wholesalerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wholesaler orders:', error);
    throw error;
  }

  console.log('Wholesaler orders fetched:', data);
  return data;
};

export const confirmOrder = async (orderId: string, notes?: string) => {
  return updateOrderStatus(orderId, 'confirmed', notes);
};

export const rejectOrder = async (orderId: string, notes?: string) => {
  return updateOrderStatus(orderId, 'rejected', notes);
};

export const reusePreviousOrder = async (orderId: string) => {
  console.log('Reusing previous order:', orderId);
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order for reuse:', error);
    throw error;
  }

  // Create a new order based on the previous one
  const newOrderData = {
    buyer_id: order.buyer_id,
    shop_id: order.shop_id,
    total_amount: order.total_amount,
    payment_method: order.payment_method,
    buyer_name: order.buyer_name,
    buyer_phone: order.buyer_phone,
    buyer_address: order.buyer_address,
    status: 'pending'
  };

  const { data: newOrder, error: createError } = await supabase
    .from('orders')
    .insert([newOrderData])
    .select()
    .single();

  if (createError) {
    console.error('Error creating reused order:', createError);
    throw createError;
  }

  console.log('Order reused successfully:', newOrder);
  return newOrder;
};

export const getOrderMessages = async (orderId: string) => {
  console.log('Fetching messages for order:', orderId);
  
  const { data, error } = await supabase
    .from('order_messages')
    .select(`
      *,
      profiles (
        email,
        contact_name,
        business_name
      )
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching order messages:', error);
    throw error;
  }

  console.log('Order messages fetched:', data);
  return data;
};

export const sendOrderMessage = async (orderId: string, message: string) => {
  console.log('Sending message for order:', orderId, message);
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('order_messages')
    .insert([{
      order_id: orderId,
      sender_id: user.user.id,
      message: message
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending order message:', error);
    throw error;
  }

  console.log('Order message sent successfully:', data);
  return data;
};
