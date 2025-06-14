
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

export const getProductsByWholesaler = async (): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (shopsError) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }

  if (!shops.length) return [];

  const shopIds = shops.map(shop => shop.id);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('shop_id', shopIds)
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

export const updateProduct = async (productId: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return data[0] as Product;
};

export const uploadImage = async (bucket: string, fileName: string, file: File): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return urlData.publicUrl;
};
