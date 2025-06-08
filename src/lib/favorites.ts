
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
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
    console.error('Error adding to favorites:', error);
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
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getFavoriteProducts = async (): Promise<Favorite[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data;
};
