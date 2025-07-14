
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  category_id?: string;
  moq?: number;
  created_at: string;
  shops?: {
    id: string;
    name: string;
    contact: string;
    address: string;
    owner_id: string;
  };
}

export const createProduct = async (productData: {
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category_id?: string;
  moq?: number;
}): Promise<Product> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate required fields
    if (!productData.name || !productData.price || !productData.shop_id) {
      throw new Error('Missing required fields: name, price, and shop_id are required');
    }

    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Verify user owns the shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', productData.shop_id)
      .single();

    if (shopError) {
      throw new Error('Failed to verify shop ownership');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only add products to your own shops');
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        is_active: true,
        verification_status: 'pending',
        moq: productData.moq || 1
      })
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .single();

    if (error) {
      console.error('Product creation error:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from product creation');
    }

    return data as Product;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const getProductsByShop = async (shopId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by shop:', error);
      throw error;
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Error in getProductsByShop:', error);
    throw error;
  }
};

export const getProductsByWholesaler = async (): Promise<Product[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .eq('shops.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler products:', error);
      throw error;
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Error in getProductsByWholesaler:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'shops'>>
): Promise<Product> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user owns the product through shop ownership
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(owner_id)
      `)
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error('Product not found');
    }

    if (product.shops.owner_id !== user.id) {
      throw new Error('You can only update your own products');
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .single();

    if (error) {
      console.error('Product update error:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data as Product;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user owns the product through shop ownership
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(owner_id)
      `)
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error('Product not found');
    }

    if (product.shops.owner_id !== user.id) {
      throw new Error('You can only delete your own products');
    }

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (error) {
      console.error('Product deletion error:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

export const getActiveProducts = async (limit: number = 20): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .eq('is_active', true)
      .in('verification_status', ['approved', 'pending'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Error in getActiveProducts:', error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Product not found
      }
      console.error('Error fetching product by ID:', error);
      throw error;
    }

    return data as Product;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
};

// Export uploadImage from storage
export { uploadImage };
