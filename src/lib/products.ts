
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
  return data as any[];
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
  return data as any;
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
  return data as any[];
};

export const getProductsByWholesaler = async (wholesalerId: string) => {
  console.log('Fetching products for wholesaler:', wholesalerId);
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shops!inner (
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
    .eq('shops.owner_id', wholesalerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wholesaler products:', error);
    throw error;
  }

  console.log('Wholesaler products fetched:', data);
  return data as any[];
};

export const createProduct = async (productData: any) => {
  console.log('Creating product:', productData);
  
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  console.log('Product created successfully:', data);
  return data;
};

export const updateProduct = async (id: string, updates: any) => {
  console.log('Updating product:', id, updates);
  
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  console.log('Product updated successfully:', data);
  return data;
};

export const deleteProduct = async (id: string) => {
  console.log('Deleting product:', id);
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }

  console.log('Product deleted successfully');
  return true;
};

export const uploadImage = async (file: File, bucket: string = 'product_images') => {
  console.log('Uploading image to bucket:', bucket);
  
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL for the uploaded image
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  console.log('Image uploaded successfully:', publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
};
