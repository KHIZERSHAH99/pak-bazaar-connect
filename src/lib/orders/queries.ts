
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Get orders for wholesaler with simplified return type
export const getWholesalerOrders = async (showFullDetails: boolean = false): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get shop IDs for the wholesaler
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (shopsError || !shops.length) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }

  const shopIds = shops.map(shop => shop.id);

  // Use a simpler approach - always select the same fields and filter client-side if needed
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
      shops(id, name, contact, address, postal_code, owner_id),
      profiles!orders_buyer_id_fkey(id, email, role, business_name)
    `)
    .in('shop_id', shopIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data ? data : [];
};

// Get seller orders with explicit type handling
export const getSellerOrders = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

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
      shops(id, name, contact, address, postal_code, owner_id),
      profiles!orders_buyer_id_fkey(email)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller orders:', error);
    return [];
  }

  // Return the data directly without complex type inference
  return data ? data : [];
};
