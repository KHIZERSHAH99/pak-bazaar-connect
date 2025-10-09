
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import type { Order, OrderStatus } from '@/lib/types';

export const fetchOrdersWithAnalytics = async (
  startDate: string,
  endDate: string
): Promise<Order[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders with analytics:', error);
      throw error;
    }

    // Transform and filter data with proper typing and handle deleted shops
    const transformedData = (data || []).filter(item => {
      return item && 
             typeof item === 'object' && 
             'id' in item && 
             item.id &&
             typeof item.id === 'string';
    }).map(item => ({
      ...item,
      status: item.status as OrderStatus,
      shops: item.shops ? {
        id: item.shops.id,
        name: item.shops.name,
        contact: item.shops.contact || '',
        address: item.shops.address || '',
        postal_code: item.shops.postal_code || '',
        owner_id: item.shops.owner_id
      } : {
        id: 'deleted',
        name: 'Shop No Longer Available',
        contact: 'N/A',
        address: 'N/A',
        postal_code: 'N/A',
        owner_id: 'deleted'
      }
    })) as Order[];

    return transformedData;
  } catch (error) {
    console.error('Error in fetchOrdersWithAnalytics:', error);
    throw error;
  }
};

export const validateOrderData = (orderData: any): boolean => {
  const requiredFields = [
    'buyer_id', 'shop_id', 'total_amount', 'status',
    'buyer_name', 'buyer_phone', 'buyer_address'
  ];

  for (const field of requiredFields) {
    if (!(field in orderData) || orderData[field] === null || orderData[field] === undefined) {
      console.warn(`Missing or invalid field: ${field}`);
      return false;
    }
  }

  if (typeof orderData.total_amount !== 'number' || orderData.total_amount <= 0) {
    console.warn('Invalid total_amount: Must be a positive number');
    return false;
  }

  const allowedStatuses: OrderStatus[] = ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'];
  if (!allowedStatuses.includes(orderData.status)) {
    console.warn(`Invalid status: ${orderData.status}. Allowed statuses are: ${allowedStatuses.join(', ')}`);
    return false;
  }

  return true;
};

export const createOrderWithValidation = async (orderData: any): Promise<Order | null> => {
  if (!validateOrderData(orderData)) {
    console.error('Validation failed for order data');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    if (!data) {
      console.error('No order data returned after creation');
      return null;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;

    return transformedData;
  } catch (error) {
    console.error('Error in createOrderWithValidation:', error);
    return null;
  }
};

export const getWholesalerOrders = async (): Promise<Order[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler orders:', error);
      throw error;
    }

    // Transform and filter data with proper typing
    const transformedData = (data || []).filter(item => {
      return item && 
             typeof item === 'object' && 
             'id' in item && 
             item.id &&
             typeof item.id === 'string';
    }).map(item => ({
      ...item,
      status: item.status as OrderStatus,
      shops: item.shops ? {
        id: item.shops.id,
        name: item.shops.name,
        contact: item.shops.contact || '',
        address: item.shops.address || '',
        postal_code: item.shops.postal_code || '',
        owner_id: item.shops.owner_id
      } : undefined
    })) as Order[];

    return transformedData;
  } catch (error) {
    console.error('Error in getWholesalerOrders:', error);
    throw error;
  }
};

export const getSellerOrders = async (): Promise<Order[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id (
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

    // Transform and filter data with proper typing
    const transformedData = (data || []).filter(item => {
      return item && 
             typeof item === 'object' && 
             'id' in item && 
             item.id &&
             typeof item.id === 'string';
    }).map(item => ({
      ...item,
      status: item.status as OrderStatus,
      shops: item.shops ? {
        id: item.shops.id,
        name: item.shops.name,
        contact: item.shops.contact || '',
        address: item.shops.address || '',
        postal_code: item.shops.postal_code || '',
        owner_id: item.shops.owner_id
      } : undefined
    })) as Order[];

    return transformedData;
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }

    if (!data) {
      console.log(`Order with ID ${orderId} not found`);
      return null;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;

    return transformedData;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    if (!data) {
      console.error('No order data returned after status update');
      return null;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;

    return transformedData;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return null;
  }
};

export const addWholesalerNotes = async (orderId: string, notes: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ wholesaler_notes: notes })
      .eq('id', orderId)
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error adding wholesaler notes:', error);
      throw error;
    }

    if (!data) {
      console.error('No order data returned after adding notes');
      return null;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;

    return transformedData;
  } catch (error) {
    console.error('Error in addWholesalerNotes:', error);
    return null;
  }
};

export const confirmOrder = async (orderId: string, notes?: string): Promise<Order | null> => {
  try {
    const updateData: any = { 
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    };
    
    if (notes) {
      updateData.wholesaler_notes = notes;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error confirming order:', error);
      throw error;
    }

    if (!data) {
      console.error('No order data returned after confirmation');
      return null;
    }

    return {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;
  } catch (error) {
    console.error('Error in confirmOrder:', error);
    return null;
  }
};

export const rejectOrder = async (orderId: string, reason: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        wholesaler_notes: reason
      })
      .eq('id', orderId)
      .select(`
        *,
        shops!fk_orders_shop_id (
          id,
          name,
          contact,
          address,
          postal_code,
          owner_id
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }

    if (!data) {
      console.error('No order data returned after rejection');
      return null;
    }

    return {
      ...data,
      status: data.status as OrderStatus,
      shops: data.shops ? {
        id: data.shops.id,
        name: data.shops.name,
        contact: data.shops.contact || '',
        address: data.shops.address || '',
        postal_code: data.shops.postal_code || '',
        owner_id: data.shops.owner_id
      } : undefined
    } as Order;
  } catch (error) {
    console.error('Error in rejectOrder:', error);
    return null;
  }
};

export const createOrderWithPayment = async (
  shopId: string,
  totalAmount: number,
  paymentMethod: string,
  paymentScreenshot: File,
  buyerInfo?: {
    buyer_name: string;
    buyer_phone: string;
    buyer_address: string;
  }
): Promise<Order | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestOrder = !user;
    
    // For guest orders, require buyer info
    if (isGuestOrder && !buyerInfo) {
      throw new Error('Buyer information is required for guest orders');
    }

    // Upload payment screenshot
    const userId = user?.id || 'guest';
    const screenshotPath = `${userId}/${Date.now()}_${paymentScreenshot.name}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(screenshotPath, paymentScreenshot);

    if (uploadError) {
      throw new Error(`Failed to upload payment screenshot: ${uploadError.message}`);
    }

    // Create order
    const orderData = {
      buyer_id: user?.id || '00000000-0000-0000-0000-000000000000', // Special UUID for guest orders
      shop_id: shopId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_screenshot: screenshotPath,
      screenshot_uploaded_at: new Date().toISOString(),
      status: 'pending',
      is_guest_order: isGuestOrder,
      buyer_name: buyerInfo?.buyer_name || 'Unknown',
      buyer_phone: buyerInfo?.buyer_phone || '',
      buyer_address: buyerInfo?.buyer_address || ''
    };

    const order = await createOrderWithValidation(orderData);
    if (!order) {
      throw new Error('Failed to create order');
    }

    return order;
  } catch (error) {
    console.error('Error in createOrderWithPayment:', error);
    throw error;
  }
};

export const reusePreviousOrder = async (previousOrderId: string): Promise<any> => {
  try {
    const previousOrder = await getOrderById(previousOrderId);
    if (!previousOrder) {
      throw new Error('Previous order not found');
    }

    return {
      shopId: previousOrder.shop_id,
      shopName: previousOrder.shops?.name || 'Unknown Shop',
      totalAmount: previousOrder.total_amount
    };
  } catch (error) {
    console.error('Error in reusePreviousOrder:', error);
    throw error;
  }
};

export const getOrderMessages = async (orderId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('order_messages')
      .select(`
        *,
        profiles!order_messages_sender_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching order messages:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrderMessages:', error);
    return [];
  }
};

export const sendOrderMessage = async (orderId: string, message: string): Promise<any> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: orderId,
        sender_id: user.id,
        message: message
      })
      .select(`
        *,
        profiles!order_messages_sender_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .maybeSingle();

    if (error) {
      console.error('Error sending order message:', error);
      throw error;
    }

    if (!data) {
      console.error('No message data returned after sending');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in sendOrderMessage:', error);
    throw error;
  }
};
