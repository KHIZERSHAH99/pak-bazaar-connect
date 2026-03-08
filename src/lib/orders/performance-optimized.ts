
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Optimized order queries using indexes and foreign key constraints
export const getOptimizedSellerOrders = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Uses idx_orders_buyer_status_created index for optimal performance
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
      shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50); // Pagination for better performance

  if (error) {
    console.error('Error fetching optimized seller orders:', error);
    return [];
  }

  return data || [];
};

export const getOptimizedWholesalerOrders = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get shop IDs using the foreign key constraint
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (shopsError || !shops?.length) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }

  const shopIds = shops.map(shop => shop.id);

  // Uses idx_orders_shop_status_created index for optimal performance
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
      shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id),
      profiles!buyer_id(id, email, business_name)
    `)
    .in('shop_id', shopIds)
    .order('created_at', { ascending: false })
    .limit(100); // Pagination for better performance

  if (error) {
    console.error('Error fetching optimized wholesaler orders:', error);
    return [];
  }

  return data || [];
};

// Optimized order stats using direct queries
export const getOrderStats = async (userRole: 'seller' | 'wholesaler'): Promise<any> => {
  const user = await getCurrentUser();
  if (!user) return null;

  if (userRole === 'seller') {
    // Uses idx_orders_buyer_status_created index
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('buyer_id', user.id);

    if (error) {
      console.error('Error fetching seller order stats:', error);
      return null;
    }

    return {
      total: data?.length || 0,
      pending: data?.filter(o => o.status === 'pending').length || 0,
      confirmed: data?.filter(o => o.status === 'confirmed').length || 0,
      completed: data?.filter(o => o.status === 'completed').length || 0,
      rejected: data?.filter(o => o.status === 'rejected').length || 0,
      totalValue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    };
  } else {
    // For wholesalers, calculate stats from orders
    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (shops?.length) {
      const shopIds = shops.map(s => s.id);
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .in('shop_id', shopIds);

      if (!error && data) {
        return {
          total: data.length,
          pending: data.filter(o => o.status === 'pending').length,
          confirmed: data.filter(o => o.status === 'confirmed').length,
          completed: data.filter(o => o.status === 'completed').length,
          rejected: data.filter(o => o.status === 'rejected').length,
          totalValue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        };
      }
    }
    return null;
  }
};

// Optimized order creation with constraint validation
export const createOptimizedOrder = async (orderData: {
  shopId: string;
  totalAmount: number;
  paymentMethod?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
}): Promise<any> => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Validate constraints
  if (!orderData.shopId || !orderData.totalAmount) {
    throw new Error('Shop ID and total amount are required');
  }
  
  if (orderData.totalAmount <= 0) {
    throw new Error('Order amount must be greater than 0');
  }

  // Validate payment method against check constraint
  const validPaymentMethods = ['bank_transfer', 'jazzcash', 'easypaisa'];
  const paymentMethod = orderData.paymentMethod || 'bank_transfer';
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }
  
  // Check if user is not ordering from own shop (foreign key constraint will help)
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', orderData.shopId)
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw new Error('Shop not found');
  }
  
  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: user.id,
      shop_id: orderData.shopId,
      total_amount: orderData.totalAmount,
      payment_method: paymentMethod,
      buyer_name: orderData.buyerName,
      buyer_phone: orderData.buyerPhone,
      buyer_address: orderData.buyerAddress,
      status: 'pending'
    }])
    .select(`
      *,
      shops!fk_orders_shop_id(id, name, contact, address, owner_id)
    `)
    .single();
  
  if (error) {
    console.error('Error creating optimized order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
  
  return data;
};

// Optimized order status update using foreign key constraints
export const updateOptimizedOrderStatus = async (
  orderId: string, 
  status: string, 
  notes?: string
): Promise<any> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // Validate status against check constraint
  const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid order status');
  }
  
  // Verify user owns the shop for this order using foreign key joins
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
  
  const updateData: any = { status };
  
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === 'rejected') {
    updateData.rejected_at = new Date().toISOString();
    if (notes) updateData.rejection_reason = notes;
  } else if (status === 'completed') {
    updateData.delivered_at = new Date().toISOString();
  }
  
  if (notes && status !== 'rejected') {
    updateData.wholesaler_notes = notes;
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select(`
      *,
      shops!fk_orders_shop_id(id, name, contact, address, owner_id)
    `)
    .single();
      
  if (error) {
    console.error('Error updating optimized order status:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }
  
  return data;
};

// Simplified performance analytics function
export const getShopPerformanceStats = async (shopIds: string[]): Promise<any> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('shop_id, status, total_amount, created_at')
    .in('shop_id', shopIds);

  if (error) {
    console.error('Error fetching shop performance stats:', error);
    return null;
  }

  // Calculate stats client-side
  const stats = shopIds.map(shopId => {
    const shopOrders = orders?.filter(o => o.shop_id === shopId) || [];
    return {
      shop_id: shopId,
      total_orders: shopOrders.length,
      completed_orders: shopOrders.filter(o => o.status === 'completed').length,
      total_sales: shopOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      avg_order_value: shopOrders.length > 0 
        ? shopOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / shopOrders.length 
        : 0
    };
  });

  return stats;
};
