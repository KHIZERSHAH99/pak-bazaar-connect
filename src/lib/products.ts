
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

// Product functions
export const getProductsByShop = async (shopId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data as Product[];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  // Ensure verification_status is set to pending by default
  const productData = {
    ...product,
    verification_status: 'pending'
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
  
  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  
  return data[0] as Product;
};
