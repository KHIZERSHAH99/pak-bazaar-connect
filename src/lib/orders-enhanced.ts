import { supabase } from '@/integrations/supabase/client';
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
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
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

    // Transform and filter data with proper typing
    const transformedData = (data || []).filter(item => {
      return item && 
             typeof item === 'object' && 
             'id' in item && 
             item.id &&
             typeof item.id === 'string';
    }).map(item => ({
      ...item,
      status: item.status as OrderStatus
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
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus
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
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
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
      status: item.status as OrderStatus
    })) as Order[];

    return transformedData;
  } catch (error) {
    console.error('Error in getWholesalerOrders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .eq('id', orderId)
      .single();

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
      status: data.status as OrderStatus
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
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus
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
        shops!inner (
          id,
          name,
          owner_id
        ),
        profiles!orders_buyer_id_fkey (
          id,
          email,
          business_name
        )
      `)
      .single();

    if (error) {
      console.error('Error adding wholesaler notes:', error);
      throw error;
    }

    // Transform the data with proper typing
    const transformedData = {
      ...data,
      status: data.status as OrderStatus
    } as Order;

    return transformedData;
  } catch (error) {
    console.error('Error in addWholesalerNotes:', error);
    return null;
  }
};
