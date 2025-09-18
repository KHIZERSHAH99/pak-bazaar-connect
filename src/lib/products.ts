import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';
import { Product } from '@/lib/types';

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

    // Enhanced validation
    if (!productData.name?.trim() || !productData.price || !productData.shop_id) {
      throw new Error('Missing required fields: name, price, and shop_id are required');
    }

    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (productData.name.trim().length < 3 || productData.name.trim().length > 100) {
      throw new Error('Product name must be between 3 and 100 characters');
    }

    if (productData.moq && productData.moq < 1) {
      throw new Error('Minimum order quantity must be at least 1');
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
        verification_status: 'approved',
        moq: productData.moq || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from product creation');
    }

    // Get the full product with relationships
    return await getProductById(data.id) || data as Product;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const getProductsByShop = async (shopId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by shop:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get shop and category info separately
    const [shopData, categoryData] = await Promise.all([
      supabase.from('shops').select('*').eq('id', shopId).single(),
      supabase.from('categories').select('*')
    ]);

    const shop = shopData.data;
    const categories = categoryData.data || [];

    return data.map(product => ({
      ...product,
      shops: shop,
      categories: categories.find(cat => cat.id === product.category_id) || null
    })) as Product[];
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

    // First get shops owned by the wholesaler
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', user.id);

    if (shopsError) {
      console.error('Error fetching wholesaler shops:', shopsError);
      throw shopsError;
    }

    if (!shops || shops.length === 0) {
      return [];
    }

    const shopIds = shops.map(shop => shop.id);

    // Then get products only from those shops
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler products:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    return data.map(product => {
      const shop = shops.find(s => s.id === product.shop_id);
      const category = categories?.find(cat => cat.id === product.category_id);
      
      return {
        ...product,
        shops: shop || null,
        categories: category || null
      };
    }) as Product[];
  } catch (error) {
    console.error('Error in getProductsByWholesaler:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'shops' | 'categories'>>
): Promise<Product> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First get the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error('Product not found');
    }

    // Then get the shop to verify ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', product.shop_id)
      .single();

    if (shopError) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only update your own products');
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    // Get the full product with relationships
    return await getProductById(productId) || data as Product;
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

    // First get the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error('Product not found');
    }

    // Then get the shop to verify ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', product.shop_id)
      .single();

    if (shopError) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
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
    // Use the new RPC function to avoid RLS issues
    const { data, error } = await supabase
      .rpc('get_active_products_list');

    if (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get categories separately
    const categoriesData = await supabase.from('categories').select('*');
    const categories = categoriesData.data || [];

    return data.map(product => ({
      ...product,
      shops: product.shop_name ? {
        id: product.shop_id,
        name: product.shop_name,
        logo: product.shop_logo
      } : null,
      categories: categories.find(cat => cat.id === product.category_id) || null
    })) as Product[];
  } catch (error) {
    console.error('Error in getActiveProducts:', error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    console.log('🔍 getProductById: Fetching product with ID:', productId);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching product by ID:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ Product not found for ID:', productId);
      return null;
    }

    // Get related data separately
    const [shopData, categoryData, specsData, imagesData, pricingData] = await Promise.all([
      supabase.from('shops').select('*').eq('id', data.shop_id).single(),
      data.category_id ? supabase.from('categories').select('*').eq('id', data.category_id).single() : null,
      supabase.from('product_specifications').select('*').eq('product_id', productId),
      supabase.from('product_images').select('*').eq('product_id', productId),
      supabase.from('product_pricing_tiers').select('*').eq('product_id', productId)
    ]);

    const result = {
      ...data,
      shops: shopData.data || null,
      categories: categoryData?.data || null,
      product_specifications: specsData.data || [],
      product_images: imagesData.data || [],
      product_pricing_tiers: pricingData.data || []
    };

    console.log('✅ Product found:', {
      id: result.id,
      name: result.name,
      shopId: result.shop_id,
      shopName: result.shops?.name,
      shopOwner: result.shops?.owner_id
    });

    return result as Product;
  } catch (error) {
    console.error('💥 Error in getProductById:', error);
    return null;
  }
};

// Export uploadImage from storage
export { uploadImage };