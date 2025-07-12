
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

export const getOrdersByBuyer = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops (
          name,
          contact,
          owner_id
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrdersByBuyer:', error);
    return [];
  }
};

export const getOrdersByWholesaler = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!inner (
          name,
          contact,
          owner_id
        )
      `)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrdersByWholesaler:', error);
    return [];
  }
};
