
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';

export const createOrderWithPaymentEnhanced = async (
  shop_id: string,
  total_amount: number,
  payment_method: PaymentMethod,
  payment_screenshot: File | null
): Promise<Order> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // Upload payment screenshot if provided
    let payment_screenshot_url = null;
    if (payment_screenshot) {
      const fileName = `payment_proof_${user.id}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, payment_screenshot, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading payment screenshot:', error);
        throw new Error('Failed to upload payment screenshot');
      }

      payment_screenshot_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment_proofs/${fileName}`;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          buyer_id: user.id,
          shop_id,
          total_amount,
          status: 'pending',
          payment_method,
          payment_screenshot: payment_screenshot_url,
          screenshot_uploaded_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    return orderData as Order;
  } catch (error: any) {
    console.error('Error in createOrderWithPaymentEnhanced:', error);
    throw error;
  }
};

export const confirmOrderEnhanced = async (orderId: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error confirming order:', error);
      throw new Error('Failed to confirm order');
    }

    return data as Order;
  } catch (error: any) {
    console.error('Error in confirmOrderEnhanced:', error);
    throw error;
  }
};

export const rejectOrderEnhanced = async (orderId: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error rejecting order:', error);
      throw new Error('Failed to reject order');
    }

    return data as Order;
  } catch (error: any) {
    console.error('Error in rejectOrderEnhanced:', error);
    throw error;
  }
};

export const getOrderWithSecurity = async (orderId: string): Promise<Order | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .or(`buyer_id.eq.${user.id},shop_id.in.(${
                supabase
                    .from('shops')
                    .select('id')
                    .eq('owner_id', user.id)
                    .then(res => res.data?.map(shop => shop.id).join(','))
            })`)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            return null;
        }

        return data as Order;
    } catch (error: any) {
        console.error('Error in getOrderWithSecurity:', error);
        return null;
    }
};

export const getWholesalerOrders = async (includeFullDetails = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    // Build the select query properly
    let selectQuery = `
      *,
      shops!inner (
        id,
        name,
        contact,
        address,
        postal_code,
        owner_id
      )
    `;
    
    if (includeFullDetails) {
      selectQuery += `,
      profiles!orders_buyer_id_fkey (email)`;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(selectQuery)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler orders:', error);
      throw error;
    }

    // Return properly filtered and typed data
    return (data || []).filter(item => item && typeof item === 'object' && item.id);
  } catch (error) {
    console.error('Error in getWholesalerOrders:', error);
    throw error;
  }
};

export const getSellerOrders = async (): Promise<any[]> => {
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
          address,
          postal_code,
          owner_id
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }

    // Filter out null items and ensure proper structure
    return (data || []).filter(item => item && typeof item === 'object' && item.id);
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    throw error;
  }
};

export const reusePreviousOrder = async (orderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching previous order:', error);
      throw new Error('Failed to fetch previous order');
    }

    return {
      shopId: data.shop_id,
      shopName: data.shop_name || 'Unknown Shop',
      totalAmount: data.total_amount
    };
  } catch (error: any) {
    console.error('Error in reusePreviousOrder:', error);
    throw error;
  }
};
