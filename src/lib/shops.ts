
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  commission_rate?: number;
  city_id?: string;
  created_at?: string;
  cities?: {
    id: string;
    name: string;
    province: string;
  };
  is_verified?: boolean;
}

export const createShop = async (shopData: {
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  city_id?: string;
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
      .select(`
        *,
        cities!shops_city_id_fkey(id, name, province)
      `)
      .single();

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

export const updateShop = async (
  shopId: string,
  updates: Partial<Omit<Shop, 'id' | 'owner_id' | 'created_at'>>
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
      .single();

    if (shopError) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only update your own shops');
    }

    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select(`
        *,
        cities!shops_city_id_fkey(id, name, province)
      `)
      .single();

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

export const getShopsByOwner = async (): Promise<Shop[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        cities!shops_city_id_fkey(id, name, province)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user shops:', error);
      throw error;
    }

    return (data || []) as Shop[];
  } catch (error) {
    console.error('Error in getShopsByOwner:', error);
    throw error;
  }
};

export const getAllShops = async (): Promise<Shop[]> => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        cities!shops_city_id_fkey(id, name, province),
        company_profiles!shops_owner_id_fkey(*)
      `)
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

// Export uploadImage from storage
export { uploadImage };
