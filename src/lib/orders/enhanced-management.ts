import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, OrderStatusHistory, OrderItem } from '@/lib/types';

// Enhanced order fetching with status history and items
export const getEnhancedOrdersForWholesaler = async (): Promise<Order[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (shopsError || !shops.length) {
      console.error('Error fetching shops:', shopsError);
      return [];
    }

    const shopIds = shops.map(shop => shop.id);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id),
        profiles!buyer_id(id, email, business_name),
        order_items(*),
        order_status_history(*, profiles!changed_by(id, email, business_name))
      `)
      .in('shop_id', shopIds)
      .order('last_status_update', { ascending: false });

    if (error) {
      console.error('Error fetching enhanced orders:', error);
      return [];
    }

    return (data || []) as any;
  } catch (err) {
    console.error('Error in getEnhancedOrdersForWholesaler:', err);
    return [];
  }
};

export const getEnhancedOrdersForSeller = async (): Promise<Order[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id),
        order_items(*),
        order_status_history(*, profiles!changed_by(id, email, business_name))
      `)
      .eq('buyer_id', user.id)
      .order('last_status_update', { ascending: false });

    if (error) {
      console.error('Error fetching enhanced seller orders:', error);
      return [];
    }

    return (data || []) as any;
  } catch (err) {
    console.error('Error in getEnhancedOrdersForSeller:', err);
    return [];
  }
};

// Update order status with enhanced tracking
export const updateOrderStatusEnhanced = async (
  orderId: string,
  newStatus: OrderStatus,
  data?: {
    notes?: string;
    trackingNumber?: string;
    carrierName?: string;
    estimatedDelivery?: string;
    internalNotes?: string;
    requiresAttention?: boolean;
    priorityLevel?: number;
  }
): Promise<Order | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user owns the shop for this order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id(owner_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error('Order not found');
    }

    if (order.shops.owner_id !== user.id) {
      throw new Error('You can only update orders for your own shop');
    }

    const updateData: any = { 
      status: newStatus,
      last_status_update: new Date().toISOString()
    };

    // Add optional fields if provided
    if (data?.notes) updateData.wholesaler_notes = data.notes;
    if (data?.trackingNumber) updateData.tracking_number = data.trackingNumber;
    if (data?.carrierName) updateData.carrier_name = data.carrierName;
    if (data?.estimatedDelivery) updateData.estimated_delivery = data.estimatedDelivery;
    if (data?.internalNotes) updateData.internal_notes = data.internalNotes;
    if (data?.requiresAttention !== undefined) updateData.requires_attention = data.requiresAttention;
    if (data?.priorityLevel) updateData.priority_level = data.priorityLevel;

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id),
        order_items(*),
        order_status_history(*, profiles!changed_by(id, email, business_name))
      `)
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return updatedOrder as Order;
  } catch (error) {
    console.error('Error in updateOrderStatusEnhanced:', error);
    throw error;
  }
};

// Get order status history
export const getOrderStatusHistory = async (orderId: string): Promise<OrderStatusHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select(`
        *,
        profiles!changed_by(id, email, business_name)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching order status history:', error);
      return [];
    }

    return data as OrderStatusHistory[];
  } catch (err) {
    console.error('Error in getOrderStatusHistory:', err);
    return [];
  }
};

// Add order items
export const addOrderItems = async (
  orderId: string,
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
): Promise<OrderItem[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const itemsToInsert = items.map(item => ({
      ...item,
      order_id: orderId
    }));

    const { data, error } = await supabase
      .from('order_items')
      .insert(itemsToInsert)
      .select('*');

    if (error) {
      console.error('Error adding order items:', error);
      throw new Error(`Failed to add order items: ${error.message}`);
    }

    return data as OrderItem[];
  } catch (error) {
    console.error('Error in addOrderItems:', error);
    throw error;
  }
};

// Get orders by status with filters
export const getOrdersByStatus = async (
  userRole: 'wholesaler' | 'seller',
  status?: OrderStatus,
  priority?: number,
  requiresAttention?: boolean
): Promise<Order[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let query = supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id),
        profiles!buyer_id(id, email, business_name),
        order_items(*),
        order_status_history(*, profiles!changed_by(id, email, business_name))
      `);

    if (userRole === 'wholesaler') {
      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (!shops?.length) return [];
      
      const shopIds = shops.map(shop => shop.id);
      query = query.in('shop_id', shopIds);
    } else {
      query = query.eq('buyer_id', user.id);
    }

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority_level', priority);
    if (requiresAttention !== undefined) query = query.eq('requires_attention', requiresAttention);

    const { data, error } = await query.order('last_status_update', { ascending: false });

    if (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }

    return (data || []) as any;
  } catch (err) {
    console.error('Error in getOrdersByStatus:', err);
    return [];
  }
};

// Get order analytics
export const getOrderAnalytics = async (userRole: 'wholesaler' | 'seller') => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    let query = supabase.from('orders').select('*');

    if (userRole === 'wholesaler') {
      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (!shops?.length) return null;
      
      const shopIds = shops.map(shop => shop.id);
      query = query.in('shop_id', shopIds);
    } else {
      query = query.eq('buyer_id', user.id);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders for analytics:', error);
      return null;
    }

    // Calculate analytics
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    const returned = orders.filter(o => o.status === 'returned').length;
    const requiresAttention = orders.filter(o => o.requires_attention).length;

    const totalValue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      pending,
      processing,
      confirmed,
      shipped,
      delivered,
      completed,
      rejected,
      returned,
      requiresAttention,
      totalValue,
      averageOrderValue,
      statusDistribution: {
        pending,
        processing,
        confirmed,
        shipped,
        delivered,
        completed,
        rejected,
        returned
      }
    };
  } catch (error) {
    console.error('Error in getOrderAnalytics:', error);
    return null;
  }
};