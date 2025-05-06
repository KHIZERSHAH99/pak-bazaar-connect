
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

// Product functions
export const getProductsByShop = async (shopId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();
  
  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  
  return data[0];
};
