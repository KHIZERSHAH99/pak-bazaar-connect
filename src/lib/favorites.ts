
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ShopFavorite {
  id: string;
  user_id: string;
  shop_id: string;
  created_at: string;
}

export const addToFavorites = async (productId: string): Promise<Favorite> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .insert([{
      user_id: user.id,
      product_id: productId
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      // Already exists, fetch existing
      const { data: existing } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();
      
      if (existing) return existing;
    }
    throw error;
  }

  return data;
};

export const removeFromFavorites = async (productId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    throw error;
  }
};

export const getFavoriteProducts = async (): Promise<Favorite[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const isProductInFavorites = async (productId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if product is in favorites:', error);
    return false;
  }

  return !!data;
};

// Shop favorites
export const addShopToFavorites = async (shopId: string): Promise<ShopFavorite> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('shop_favorites')
    .insert([{
      user_id: user.id,
      shop_id: shopId
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      // Already exists, fetch existing
      const { data: existing } = await supabase
        .from('shop_favorites')
        .select()
        .eq('user_id', user.id)
        .eq('shop_id', shopId)
        .single();
      
      if (existing) return existing;
    }
    throw error;
  }

  return data;
};

export const removeShopFromFavorites = async (shopId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('shop_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('shop_id', shopId);

  if (error) {
    throw error;
  }
};

export const getFavoriteShops = async (): Promise<ShopFavorite[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('shop_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const isShopInFavorites = async (shopId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('shop_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('shop_id', shopId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if shop is in favorites:', error);
    return false;
  }

  return !!data;
};
