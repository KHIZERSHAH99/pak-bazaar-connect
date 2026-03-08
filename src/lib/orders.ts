
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { guestSessionManager } from '@/lib/security/guest-session';
import { GUEST_USER_UUID } from '@/lib/constants';

export interface Order {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  payment_method?: string;
  payment_screenshot?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  wholesaler_notes?: string;
  rejection_reason?: string;
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  delivered_at?: string;
  shops?: {
    id: string;
    name: string;
    contact: string;
    address: string;
    owner_id: string;
  };
}

// Enhanced order creation with proper validation
export const createOrder = async (orderData: {
  shopId: string;
  totalAmount: number;
  paymentMethod?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  isGuestOrder?: boolean;
}): Promise<Order> => {
  const user = await getCurrentUser();
  
  // Allow guest orders with rate limiting
  if (!user && !orderData.isGuestOrder) {
    throw new Error('User not authenticated');
  }
  
  // Check guest order rate limit
  if (!user && orderData.isGuestOrder) {
    if (!guestSessionManager.canPlaceOrder()) {
      throw new Error('Too many orders placed. Please wait before placing another order.');
    }
  }
  
  // Validate input
  if (!orderData.shopId || !orderData.totalAmount) {
    throw new Error('Shop ID and total amount are required');
  }
  
  if (orderData.totalAmount <= 0) {
    throw new Error('Order amount must be greater than 0');
  }
  
  // Get shop details to check if user is not ordering from own shop (only for authenticated users)
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', orderData.shopId)
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw new Error('Shop not found');
  }
  
  // Only check shop ownership for authenticated users
  if (user && shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }
  
  // Prepare order data with guest session if needed
  const orderPayload: any = {
    buyer_id: user?.id || GUEST_USER_UUID,
    shop_id: orderData.shopId,
    total_amount: orderData.totalAmount,
    payment_method: orderData.paymentMethod || 'bank_transfer',
    buyer_name: orderData.buyerName,
    buyer_phone: orderData.buyerPhone,
    buyer_address: orderData.buyerAddress,
    is_guest_order: !user,
    status: 'pending'
  };
  
  // Add guest session ID for guest orders
  if (!user) {
    orderPayload.guest_session_id = guestSessionManager.getSessionId();
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select(`
      *,
      shops!fk_orders_shop_id(id, name, contact, address, owner_id)
    `)
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
  
  // Increment guest order count if successful
  if (!user) {
    guestSessionManager.incrementOrderCount();
  }
  
  return data as Order;
};

export const getOrdersForWholesaler = async (): Promise<Order[]> => {
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
        shops!fk_orders_shop_id(id, name, contact, address, owner_id)
      `)
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return (data || []) as Order[];
  } catch (err) {
    console.error('Error in getOrdersForWholesaler:', err);
    return [];
  }
};

export const getOrdersForSeller = async (): Promise<Order[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!fk_orders_shop_id(id, name, contact, address, owner_id)
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
    
    return (data || []) as Order[];
  } catch (err) {
    console.error('Error in getOrdersForSeller:', err);
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status'], 
  notes?: string
): Promise<Order> => {
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
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
    
    return data as Order;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};


export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!shop_id(id, name, contact, address, owner_id)
      `)
      .eq('id', orderId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      console.error('Error fetching order by ID:', error);
      throw error;
    }
    
    return data as Order;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};
