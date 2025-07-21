
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

export const getProducts = async (limit: number = 10) => {
  console.log('Fetching products with limit:', limit);
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        owner_id,
        contact,
        address,
        logo
      ),
      categories (
        id,
        name
      )
    `)
    .eq('is_active', true)
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  console.log('Products fetched successfully:', data);
  return data as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  console.log('Fetching product by ID:', id);
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        owner_id,
        contact,
        address,
        logo
      ),
      categories (
        id,
        name
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  console.log('Product fetched by ID:', data);
  return data as Product | null;
};

export const getProductsByShop = async (shopId: string) => {
  console.log('Fetching products for shop:', shopId);
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shops (
        id,
        name,
        owner_id,
        contact,
        address,
        logo
      ),
      categories (
        id,
        name
      )
    `)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shop products:', error);
    throw error;
  }

  console.log('Shop products fetched:', data);
  return data as Product[];
};
