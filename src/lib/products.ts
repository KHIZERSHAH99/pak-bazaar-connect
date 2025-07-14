
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Product } from '@/lib/types';

export const getProductsByShop = async (shopId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        shops:shop_id (
          id,
          name,
          owner_id,
          contact,
          address,
          postal_code,
          logo,
          commission_rate,
          city_id,
          created_at
        )
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductsByShop:', error);
    return [];
  }
};

export const getProductsByWholesaler = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        shops!inner (
          id,
          name,
          owner_id,
          contact,
          address,
          postal_code,
          logo,
          commission_rate,
          city_id,
          created_at
        )
      `)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductsByWholesaler:', error);
    return [];
  }
};

export const uploadImage = async (bucket: string, fileName: string, file: File): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify the user owns the shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', product.shop_id)
      .single();

    if (shopError || !shop || shop.owner_id !== user.id) {
      throw new Error('You can only add products to your own shops');
    }

    // Set verification_status to null for immediate visibility (as per RLS policy)
    const productData = {
      ...product,
      verification_status: null, // This allows the product to be visible immediately
      is_active: true
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        shops:shop_id (
          id,
          name,
          owner_id
        )
      `);

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        shops:shop_id (
          id,
          name,
          owner_id
        )
      `);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};
