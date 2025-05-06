
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Orders
export const createOrder = async (shopId: string, totalAmount: number) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Get shop details to check if user is not ordering from own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw shopError;
  }
  
  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: user.id,
      shop_id: shopId,
      total_amount: totalAmount,
      status: 'pending'
    }])
    .select();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data[0];
};

export const getOrdersForWholesaler = async () => {
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
      .select('*, profiles:buyer_id(email)')
      .in('shop_id', shopIds);
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Error in getOrdersForWholesaler:', err);
    return [];
  }
};

export const getSellerCommissions = async () => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('seller_id', user.id);
  
  if (error) {
    console.error('Error fetching commissions:', error);
    return [];
  }
  
  return data;
};
