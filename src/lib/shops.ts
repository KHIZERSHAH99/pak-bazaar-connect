
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Shop } from '@/lib/types';

// Shop functions
export const getShopsByOwner = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id);
  
  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
  
  return data;
};

export const createShop = async (shop: Omit<Shop, 'id' | 'owner_id' | 'created_at'>) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('shops')
    .insert([{ ...shop, owner_id: user.id }])
    .select();
  
  if (error) {
    console.error('Error creating shop:', error);
    throw error;
  }
  
  return data[0];
};

// Seller specific functions
export const getAllShops = async () => {
  const { data, error } = await supabase
    .from('shops')
    .select('*');
  
  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
  
  return data;
};
