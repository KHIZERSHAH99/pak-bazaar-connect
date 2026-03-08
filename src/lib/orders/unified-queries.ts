import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

const PAGE_SIZE = 20;

// Unified order query with pagination
export const getUnifiedOrders = async (
  userRole: 'seller' | 'wholesaler',
  page: number = 0
) => {
  const user = await getCurrentUser();
  if (!user) return { orders: [], stats: null, hasMore: false };

  try {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    if (userRole === 'seller') {
      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, payment_method,
          buyer_name, buyer_phone, buyer_address,
          created_at, confirmed_at, rejected_at, delivered_at,
          wholesaler_notes, order_notes,
          shops!shop_id(id, name, contact, address, logo, owner_id)
        `, { count: 'exact' })
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to - 1);

      if (error) throw error;

      const stats = page === 0 ? await getOrderStats(user.id, 'seller') : null;
      return { orders: data || [], stats, hasMore: (count || 0) > to };
    } else {
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      if (shopsError) throw shopsError;
      if (!shops?.length) return { orders: [], stats: null, hasMore: false };

      const shopIds = shops.map(s => s.id);

      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, payment_method,
          buyer_name, buyer_phone, buyer_address,
          created_at, confirmed_at, rejected_at, delivered_at,
          order_notes, wholesaler_notes,
          shops!shop_id(id, name),
          profiles!buyer_id(id, email, business_name, phone_number)
        `, { count: 'exact' })
        .in('shop_id', shopIds)
        .order('created_at', { ascending: false })
        .range(from, to - 1);

      if (error) throw error;

      const stats = page === 0 ? await getOrderStats(user.id, 'wholesaler', shopIds) : null;
      return { orders: data || [], stats, hasMore: (count || 0) > to };
    }
  } catch (error) {
    console.error('Error fetching unified orders:', error);
    return { orders: [], stats: null, hasMore: false };
  }
};

// Separate stats query (only on first page load)
async function getOrderStats(userId: string, role: 'seller' | 'wholesaler', shopIds?: string[]) {
  try {
    let query = supabase.from('orders').select('status, total_amount');
    
    if (role === 'seller') {
      query = query.eq('buyer_id', userId);
    } else if (shopIds?.length) {
      query = query.in('shop_id', shopIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).reduce((acc, order) => {
      acc.total++;
      acc[order.status] = (acc[order.status] || 0) + 1;
      acc.totalValue += Number(order.total_amount || 0);
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, completed: 0, delivered: 0, shipped: 0, rejected: 0, totalValue: 0 } as Record<string, number>);
  } catch {
    return null;
  }
}

// Optimistic update helper for order status changes
export const optimisticUpdateOrderStatus = (
  orderId: string,
  newStatus: string,
  notes?: string
) => {
  return async () => {
    const updates: Record<string, any> = {
      status: newStatus,
      last_status_update: new Date().toISOString()
    };
    if (notes) updates.wholesaler_notes = notes;
    if (newStatus === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (newStatus === 'rejected') updates.rejected_at = new Date().toISOString();
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;
    return { orderId, newStatus, notes };
  };
};

// Batch update multiple orders
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

// Subscribe to realtime order changes
export const subscribeToOrders = (
  userRole: 'seller' | 'wholesaler',
  onNewOrder: (order: any) => void,
  onStatusChange: (payload: any) => void
) => {
  const channel = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => onNewOrder(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => onStatusChange(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
