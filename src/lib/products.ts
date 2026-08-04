import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';
import { Product } from '@/lib/types';
import { validateAndSanitizeInput } from '@/lib/security/simple-validation';
import { sanitizeUserInput } from '@/lib/security/content-sanitizer';

export const createProduct = async (productData: {
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category_id?: string;
  moq?: number;
  is_active?: boolean;
  package_weight?: number | null;
  package_dimensions?: string | null;
  stock_quantity?: number | null;
  warranty_info?: string | null;
  certifications?: string[] | null;
  customization_available?: boolean | null;
  colors_available?: string[] | null;
  packaging_type?: string | null;
  units_per_package?: number | null;
  sample_available?: boolean | null;
  sample_price?: number | null;
  brand?: string | null;
  model_number?: string | null;
  origin_country?: string | null;
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

    if (productData.name.trim().length < 2 || productData.name.trim().length > 100) {
      throw new Error('Product name must be between 2 and 100 characters');
    }

    if (productData.moq && productData.moq < 1) {
      throw new Error('Minimum order quantity must be at least 1');
    }

    // XSS sanitization for user-provided content
    const nameValidation = await validateAndSanitizeInput(productData.name, 'business', 100);
    if (!nameValidation.isValid && nameValidation.securityThreats.length > 0) {
      throw new Error('Invalid product name: contains prohibited content');
    }
    
    const sanitizedDescription = productData.description 
      ? sanitizeUserInput(productData.description, 2000)
      : null;

    // Verify user owns the shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', productData.shop_id)
      .maybeSingle();

    if (shopError || !shop) {
      throw new Error('Failed to verify shop ownership');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only add products to your own shops');
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        shop_id: productData.shop_id,
        name: nameValidation.sanitizedValue,
        description: sanitizedDescription,
        price: productData.price,
        image: productData.image,
        category_id: productData.category_id,
        is_active: productData.is_active ?? true,
        verification_status: 'approved',
        moq: productData.moq || 1,
        package_weight: productData.package_weight ?? null,
        package_dimensions: productData.package_dimensions ?? null,
        stock_quantity: productData.stock_quantity ?? null,
        warranty_info: productData.warranty_info ?? null,
        certifications: productData.certifications ?? null,
        customization_available: productData.customization_available ?? false,
        colors_available: productData.colors_available ?? null,
        packaging_type: productData.packaging_type ?? null,
        units_per_package: productData.units_per_package ?? 1,
        sample_available: productData.sample_available ?? false,
        sample_price: productData.sample_price ?? null,
        brand: productData.brand ?? null,
        model_number: productData.model_number ?? null,
        origin_country: productData.origin_country ?? null
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
      supabase.from('shops').select('*').eq('id', shopId).maybeSingle(),
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
      .maybeSingle();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Then get the shop to verify ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', product.shop_id)
      .maybeSingle();

    if (shopError || !shop) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only update your own products');
    }

    // Sanitize any user-provided content in updates
    const sanitizedUpdates = { ...updates };
    
    if (updates.name) {
      const nameValidation = await validateAndSanitizeInput(updates.name, 'business', 100);
      if (nameValidation.securityThreats.length > 0) {
        throw new Error('Invalid product name: contains prohibited content');
      }
      sanitizedUpdates.name = nameValidation.sanitizedValue;
    }
    
    if (updates.description) {
      sanitizedUpdates.description = sanitizeUserInput(updates.description, 2000);
    }

    const { data, error } = await supabase
      .from('products')
      .update(sanitizedUpdates)
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
      .maybeSingle();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Then get the shop to verify ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', product.shop_id)
      .maybeSingle();

    if (shopError || !shop) {
      throw new Error('Shop not found');
    }

    if (shop.owner_id !== user.id) {
      throw new Error('You can only delete your own products');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Product deletion error:', error);
      // Fallback to soft-delete if hard delete is blocked by FK constraints
      // (e.g. product referenced by past orders)
      if (error.code === '23503') {
        const { error: softErr } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', productId);
        if (softErr) throw new Error(`Failed to delete product: ${softErr.message}`);
        return;
      }
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
        id, name, description, price, image, shop_id, is_active, category_id,
        moq, verification_status, sample_available, sample_price, created_at,
        shops!products_shop_id_fkey (id, name, logo),
        categories!products_category_id_fkey (id, name, description)
      `)
      .eq('is_active', true)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching active products:', error);
      throw error;
    }

    return (data || []) as unknown as Product[];
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error in getActiveProducts:', error);
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
      supabase.from('shops').select('*').eq('id', data.shop_id).maybeSingle(),
      data.category_id ? supabase.from('categories').select('*').eq('id', data.category_id).maybeSingle() : null,
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

// Get related products by category or same shop
export const getRelatedProducts = async (
  productId: string,
  categoryId?: string,
  shopId?: string,
  limit: number = 6
): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('verification_status', 'approved')
      .neq('id', productId)
      .limit(limit);

    // Prioritize same category, fallback to same shop
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    } else if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get shops and categories
    const shopIds = [...new Set(data.map(p => p.shop_id))];
    const categoryIds = [...new Set(data.map(p => p.category_id).filter(Boolean))];

    const [shopsData, categoriesData] = await Promise.all([
      supabase.from('shops').select('*').in('id', shopIds),
      categoryIds.length > 0 ? supabase.from('categories').select('*').in('id', categoryIds) : { data: [] }
    ]);

    const shops = shopsData.data || [];
    const categories = categoriesData.data || [];

    return data.map(product => ({
      ...product,
      shops: shops.find(s => s.id === product.shop_id) || null,
      categories: categories.find(c => c.id === product.category_id) || null
    })) as Product[];
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    return [];
  }
};

// Export uploadImage from storage
export { uploadImage };