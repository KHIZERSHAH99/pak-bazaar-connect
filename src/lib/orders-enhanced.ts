import { supabase } from '@/integrations/supabase/client';

export interface OrderFormData {
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  payment_method: 'bank_transfer' | 'jazzcash' | 'easypaisa';
  total_amount: number;
  shop_id: string;
  payment_screenshot?: File;
  ad_tracking_token?: string;
}

export const createOrder = async (orderData: OrderFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    let payment_screenshot_url = null;

    // Upload payment screenshot if provided
    if (orderData.payment_screenshot) {
      const fileExt = orderData.payment_screenshot.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, orderData.payment_screenshot);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload payment screenshot');
      }

      payment_screenshot_url = uploadData.path;
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: user.id,
        shop_id: orderData.shop_id,
        buyer_name: orderData.buyer_name,
        buyer_phone: orderData.buyer_phone,
        buyer_address: orderData.buyer_address,
        payment_method: orderData.payment_method,
        total_amount: orderData.total_amount,
        payment_screenshot: payment_screenshot_url,
        screenshot_uploaded_at: payment_screenshot_url ? new Date().toISOString() : null,
        status: 'pending'
      }])
      .select(`
        *,
        shops (
          name,
          owner_id,
          contact
        )
      `)
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    // Track ad conversion if tracking token provided
    if (orderData.ad_tracking_token) {
      try {
        const adCost = Math.max(orderData.total_amount * 0.02, 10); // 2% of order value, minimum 10 PKR
        
        const { error: trackingError } = await supabase.functions.invoke('increment-ad-spend', {
          body: {
            tracking_token: orderData.ad_tracking_token,
            order_id: order.id,
            cost_charged: adCost
          }
        });

        if (trackingError) {
          console.error('Ad tracking error:', trackingError);
          // Don't fail the order creation if ad tracking fails
        }
      } catch (trackingError) {
        console.error('Ad tracking failed:', trackingError);
        // Don't fail the order creation if ad tracking fails
      }
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const createOrderWithPayment = async (
  shopId: string,
  totalAmount: number,
  paymentDetails: {
    method: 'bank_transfer' | 'jazzcash' | 'easypaisa';
    screenshot: File;
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
  }
) => {
  return createOrder({
    shop_id: shopId,
    total_amount: totalAmount,
    payment_method: paymentDetails.method,
    buyer_name: paymentDetails.buyerName,
    buyer_phone: paymentDetails.buyerPhone,
    buyer_address: paymentDetails.buyerAddress,
    payment_screenshot: paymentDetails.screenshot
  });
};

export const confirmOrder = async (orderId: string, wholesalerNotes?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        wholesaler_notes: wholesalerNotes || null
      })
      .eq('id', orderId)
      .select(`
        *,
        shops (
          name,
          owner_id,
          contact
        )
      `)
      .single();

    if (error) {
      console.error('Error confirming order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in confirmOrder:', error);
    throw error;
  }
};

export const rejectOrder = async (orderId: string, rejectionReason: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', orderId)
      .select(`
        *,
        shops (
          name,
          owner_id,
          contact
        )
      `)
      .single();

    if (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in rejectOrder:', error);
    throw error;
  }
};

export const markOrderDelivered = async (orderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        delivered_at: new Date().toISOString(),
        delivery_confirmed_by: user.id
      })
      .eq('id', orderId)
      .select(`
        *,
        shops (
          name,
          owner_id,
          contact
        )
      `)
      .single();

    if (error) {
      console.error('Error marking order as delivered:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in markOrderDelivered:', error);
    throw error;
  }
};

export const getSellerOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops (
          id,
          name,
          contact,
          owner_id,
          address,
          postal_code
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    return [];
  }
};

export const getWholesalerOrders = async (includeFullDetails = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    // First get shop IDs owned by the user
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (shopsError) {
      console.error('Error fetching shops:', shopsError);
      return [];
    }

    if (!shops || shops.length === 0) {
      return [];
    }

    const shopIds = shops.map(shop => shop.id);

    // Then get orders for those shops with safe select clause
    const { data, error } = await supabase
      .from('orders')
      .select(`
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
        shops!inner (
          id,
          name,
          contact,
          owner_id,
          address,
          postal_code
        )
        ${includeFullDetails ? `,
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name,
          role
        )` : ''}
      `)
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler orders:', error);
      return [];
    }

    // Return the data with proper type safety - filter out any null items
    return (data || []).filter((item): item is NonNullable<typeof item> => {
      return item != null && typeof item === 'object' && 'id' in item;
    });
  } catch (error) {
    console.error('Error in getWholesalerOrders:', error);
    return [];
  }
};

export const getOrderMessages = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('order_messages')
      .select(`
        id,
        order_id,
        sender_id,
        message,
        created_at,
        profiles!order_messages_sender_id_fkey (
          id,
          email,
          business_name,
          role
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching order messages:', error);
      return [];
    }

    // Process the data to ensure proper typing
    return (data || []).map(message => ({
      ...message,
      profiles: message.profiles ? {
        ...message.profiles,
        role: message.profiles.role as any // Type assertion for UserRole
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getOrderMessages:', error);
    return [];
  }
};

export const sendOrderMessage = async (orderId: string, message: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('order_messages')
      .insert([{
        order_id: orderId,
        sender_id: user.id,
        message: message
      }])
      .select(`
        id,
        order_id,
        sender_id,
        message,
        created_at,
        profiles!order_messages_sender_id_fkey (
          id,
          email,
          business_name,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error sending order message:', error);
      throw error;
    }

    // Process the response to ensure proper typing
    return {
      ...data,
      profiles: data.profiles ? {
        ...data.profiles,
        role: data.profiles.role as any // Type assertion for UserRole
      } : undefined
    };
  } catch (error) {
    console.error('Error in sendOrderMessage:', error);
    throw error;
  }
};

export const reusePreviousOrder = async (previousOrderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // Get the previous order details
    const { data: previousOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        shops (
          id,
          name,
          contact
        )
      `)
      .eq('id', previousOrderId)
      .eq('buyer_id', user.id)
      .single();

    if (fetchError || !previousOrder) {
      throw new Error('Previous order not found');
    }

    return {
      shopId: previousOrder.shop_id,
      shopName: previousOrder.shops?.name || '',
      totalAmount: previousOrder.total_amount,
      buyerName: previousOrder.buyer_name,
      buyerPhone: previousOrder.buyer_phone,
      buyerAddress: previousOrder.buyer_address,
      paymentMethod: previousOrder.payment_method
    };
  } catch (error) {
    console.error('Error in reusePreviousOrder:', error);
    throw error;
  }
};
