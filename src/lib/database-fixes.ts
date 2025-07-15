// Critical build error fixes for backend functionality
// This file provides fixed database query helpers to resolve foreign key relationship issues

import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Enhanced order interface to match our fixed queries
export interface FixedOrder {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  payment_method?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  wholesaler_notes?: string;
  rejection_reason?: string;
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  delivered_at?: string;
  shop_name?: string;
  shop_contact?: string;
  shop_address?: string;
  shop_owner_id?: string;
}

// Fixed order queries that properly specify foreign key relationships
export const getOrdersForWholesalerFixed = async (): Promise<FixedOrder[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get shop IDs first to avoid relationship ambiguity
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (shopsError || !shops?.length) {
      console.error('Error fetching shops:', shopsError);
      return [];
    }

    const shopIds = shops.map(shop => shop.id);

    // Query orders with separate shop data fetch
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    // Fetch shop details separately to avoid relationship issues
    const { data: shopDetails, error: shopDetailsError } = await supabase
      .from('shops')
      .select('id, name, contact, address, owner_id')
      .in('id', shopIds);

    if (shopDetailsError) {
      console.error('Error fetching shop details:', shopDetailsError);
      return [];
    }

    // Merge order and shop data
    const mergedOrders: FixedOrder[] = (orders || []).map(order => {
      const shop = shopDetails?.find(s => s.id === order.shop_id);
      return {
        ...order,
        shop_name: shop?.name,
        shop_contact: shop?.contact,
        shop_address: shop?.address,
        shop_owner_id: shop?.owner_id
      } as FixedOrder;
    });

    return mergedOrders;
  } catch (error) {
    console.error('Error in getOrdersForWholesalerFixed:', error);
    return [];
  }
};

export const getOrdersForSellerFixed = async (): Promise<FixedOrder[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Query orders for the seller
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    if (!orders?.length) return [];

    // Get unique shop IDs
    const shopIds = [...new Set(orders.map(order => order.shop_id))];

    // Fetch shop details separately
    const { data: shopDetails, error: shopDetailsError } = await supabase
      .from('shops')
      .select('id, name, contact, address, owner_id')
      .in('id', shopIds);

    if (shopDetailsError) {
      console.error('Error fetching shop details:', shopDetailsError);
      return [];
    }

    // Merge order and shop data
    const mergedOrders: FixedOrder[] = orders.map(order => {
      const shop = shopDetails?.find(s => s.id === order.shop_id);
      return {
        ...order,
        shop_name: shop?.name,
        shop_contact: shop?.contact,
        shop_address: shop?.address,
        shop_owner_id: shop?.owner_id
      } as FixedOrder;
    });

    return mergedOrders;
  } catch (error) {
    console.error('Error in getOrdersForSellerFixed:', error);
    return [];
  }
};

export const updateOrderStatusFixed = async (
  orderId: string, 
  status: FixedOrder['status'], 
  notes?: string
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('shop_id, buyer_id')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      throw new Error('Order not found');
    }
    
    // Check if user owns the shop for this order
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', order.shop_id)
      .single();
    
    if (shopError) {
      throw new Error('Shop not found');
    }
    
    if (shop.owner_id !== user.id) {
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
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
      
    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOrderStatusFixed:', error);
    throw error;
  }
};

// Fixed product interface
export interface FixedProduct {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_active: boolean;
  verification_status: string;
  category_id?: string;
  moq?: number;
  created_at: string;
  shop_name?: string;
  shop_contact?: string;
  shop_address?: string;
  shop_owner_id?: string;
}

export const getProductsByShopFixed = async (shopId: string): Promise<FixedProduct[]> => {
  try {
    // Get products first
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    if (!products?.length) return [];

    // Get shop details separately
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, name, contact, address, owner_id')
      .eq('id', shopId)
      .single();

    if (shopError) {
      console.error('Error fetching shop details:', shopError);
      return products.map(p => ({ ...p } as FixedProduct));
    }

    // Merge product and shop data
    const mergedProducts: FixedProduct[] = products.map(product => ({
      ...product,
      shop_name: shop.name,
      shop_contact: shop.contact,
      shop_address: shop.address,
      shop_owner_id: shop.owner_id
    }));

    return mergedProducts;
  } catch (error) {
    console.error('Error in getProductsByShopFixed:', error);
    throw error;
  }
};

export const getActiveProductsFixed = async (limit: number = 20): Promise<FixedProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    if (!products?.length) return [];

    // Get unique shop IDs
    const shopIds = [...new Set(products.map(product => product.shop_id))];

    // Fetch shop details separately
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id, name, contact, address, owner_id')
      .in('id', shopIds);

    if (shopsError) {
      console.error('Error fetching shops:', shopsError);
      return products.map(p => ({ ...p } as FixedProduct));
    }

    // Merge product and shop data
    const mergedProducts: FixedProduct[] = products.map(product => {
      const shop = shops.find(s => s.id === product.shop_id);
      return {
        ...product,
        shop_name: shop?.name,
        shop_contact: shop?.contact,
        shop_address: shop?.address,
        shop_owner_id: shop?.owner_id
      } as FixedProduct;
    });

    return mergedProducts;
  } catch (error) {
    console.error('Error in getActiveProductsFixed:', error);
    return [];
  }
};