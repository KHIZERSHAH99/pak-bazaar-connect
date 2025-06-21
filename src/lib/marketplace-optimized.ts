
import { supabase } from '@/integrations/supabase/client';
import { Product, Shop, Category, City } from '@/lib/types';

// Optimized categories with caching
let categoriesCache: Category[] | null = null;
let categoriesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCategories = async (): Promise<Category[]> => {
  const now = Date.now();
  
  if (categoriesCache && (now - categoriesCacheTime) < CACHE_DURATION) {
    return categoriesCache;
  }
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  categoriesCache = data as Category[];
  categoriesCacheTime = now;
  return categoriesCache;
};

// Optimized cities with caching
let citiesCache: City[] | null = null;
let citiesCacheTime = 0;

export const getCities = async (): Promise<City[]> => {
  const now = Date.now();
  
  if (citiesCache && (now - citiesCacheTime) < CACHE_DURATION) {
    return citiesCache;
  }
  
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  
  citiesCache = data as City[];
  citiesCacheTime = now;
  return citiesCache;
};

// Optimized products function - removed slow getProductStats calls
export const getMarketplaceProducts = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  limit?: number;
}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name),
        shops!inner (
          id, 
          name, 
          contact, 
          address, 
          postal_code, 
          owner_id, 
          commission_rate, 
          logo, 
          city_id,
          cities (id, name, province)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.city_id) {
      query = query.eq('shops.city_id', filters.city_id);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.min_price) {
      query = query.gte('price', filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte('price', filters.max_price);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching marketplace products:', error);
      return [];
    }
    
    // Add default values without slow API calls
    const productsWithDefaults = (data || []).map((product: any) => ({
      ...product,
      avg_rating: 0, // Default rating
      total_reviews: 0, // Default reviews
      moq: product.moq || 1
    }));
    
    return productsWithDefaults as Product[];
  } catch (error) {
    console.error('Error in getMarketplaceProducts:', error);
    return [];
  }
};

// Optimized shops function
export const getMarketplaceShops = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  limit?: number;
}): Promise<Shop[]> => {
  try {
    let query = supabase
      .from('shops')
      .select(`
        *,
        cities (id, name, province)
      `)
      .order('created_at', { ascending: false });

    if (filters?.city_id) {
      query = query.eq('city_id', filters.city_id);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching marketplace shops:', error);
      return [];
    }

    // Add default values without slow API calls
    const shopsWithDefaults = (data || []).map((shop: any) => ({
      ...shop,
      avg_rating: 0,
      total_reviews: 0,
      is_verified: false
    }));
    
    return shopsWithDefaults as Shop[];
  } catch (error) {
    console.error('Error in getMarketplaceShops:', error);
    return [];
  }
};
