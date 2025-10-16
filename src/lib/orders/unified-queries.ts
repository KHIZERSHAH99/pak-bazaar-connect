import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Unified order query with single database call using proper joins
export const getUnifiedOrders = async (userRole: 'seller' | 'wholesaler') => {
  const user = await getCurrentUser();
  if (!user) return { orders: [], stats: null };

  try {
    if (userRole === 'seller') {
      // Single optimized query for seller with all needed data
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          payment_method,
          buyer_name,
          buyer_phone,
          buyer_address,
          created_at,
          confirmed_at,
          rejected_at,
          delivered_at,
          wholesaler_notes,
          shops!shop_id(id, name, contact, address, logo, owner_id)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Calculate stats in one pass
      const stats = data?.reduce((acc, order) => {
        acc.total++;
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalValue += Number(order.total_amount || 0);
        return acc;
      }, {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        rejected: 0,
        totalValue: 0
      });

      return { orders: data || [], stats };
    } else {
      // Wholesaler: Get shop IDs first, then orders with single query
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (shopsError) throw shopsError;
      if (!shops?.length) return { orders: [], stats: null };

      const shopIds = shops.map(s => s.id);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          payment_method,
          buyer_name,
          buyer_phone,
          buyer_address,
          created_at,
          confirmed_at,
          rejected_at,
          delivered_at,
          shops!shop_id(id, name),
          profiles!buyer_id(id, email, business_name, phone_number)
        `)
        .in('shop_id', shopIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate stats in one pass
      const stats = data?.reduce((acc, order) => {
        acc.total++;
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalValue += Number(order.total_amount || 0);
        return acc;
      }, {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        rejected: 0,
        totalValue: 0
      });

      return { orders: data || [], stats };
    }
  } catch (error) {
    console.error('Error fetching unified orders:', error);
    return { orders: [], stats: null };
  }
};

// Optimistic update helper for order status changes
export const optimisticUpdateOrderStatus = (
  orderId: string,
  newStatus: string,
  notes?: string
) => {
  // Return the update function for React Query's optimistic updates
  return async () => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        wholesaler_notes: notes,
        [`${newStatus}_at`]: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return { orderId, newStatus, notes };
  };
};

// Batch update multiple orders (for bulk actions)
export const batchUpdateOrders = async (
  orderIds: string[],
  updates: Partial<{ status: string; wholesaler_notes: string }>
) => {
  const { error } = await supabase
    .from('orders')
    .update(updates)
    .in('id', orderIds);

  if (error) throw error;
  return { success: true, count: orderIds.length };
};
