
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Shop } from '@/lib/types';

export const createShop = async (shopData: {
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  city_id?: string;
  logo?: string;
}): Promise<Shop> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('shops')
      .insert({
        ...shopData,
        owner_id: user.id,
      })
      .select('*')
      .maybeSingle();

    if (!data) {
      throw new Error('Failed to create shop - no data returned');
    }

    if (error) {
      console.error('Shop creation error:', error);
      throw new Error(`Failed to create shop: ${error.message}`);
    }

    return data as Shop;
  } catch (error) {
    console.error('Error in createShop:', error);
    throw error;
  }
};

export const getShopsByWholesaler = async (): Promise<Shop[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler shops:', error);
      throw error;
    }

    return (data || []) as Shop[];
  } catch (error) {
    console.error('Error in getShopsByWholesaler:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const getShopsByOwner = getShopsByWholesaler;

export const getAllShops = async (): Promise<Shop[]> => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all shops:', error);
      throw error;
    }

    return (data || []) as Shop[];
  } catch (error) {
    console.error('Error in getAllShops:', error);
    return [];
  }
};

export const getShopById = async (shopId: string): Promise<Shop | null> => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching shop by ID:', error);
      return null;
    }

    return data as Shop;
  } catch (error) {
    console.error('Error in getShopById:', error);
    return null;
  }
};

export const updateShop = async (
  shopId: string,
  updates: {
    name?: string;
    contact?: string;
    address?: string;
    postal_code?: string;
    city_id?: string;
    logo?: string;
  }
): Promise<Shop> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user owns the shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError || !shop) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only update your own shops');
    }

    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select('*')
      .maybeSingle();

    if (!data) {
      throw new Error('Failed to update shop - no data returned');
    }

    if (error) {
      console.error('Shop update error:', error);
      throw new Error(`Failed to update shop: ${error.message}`);
    }

    return data as Shop;
  } catch (error) {
    console.error('Error in updateShop:', error);
    throw error;
  }
};

export const deleteShop = async (shopId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user owns the shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError || !shop) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only delete your own shops');
    }

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (error) {
      console.error('Shop deletion error:', error);
      throw new Error(`Failed to delete shop: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteShop:', error);
    throw error;
  }
};
