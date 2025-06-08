import { supabase } from '@/integrations/supabase/client';
import { Product, Shop, Category, City, CompanyProfile, Inquiry } from '@/lib/types';

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data as Category[];
};

// Cities
export const getCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  
  return data as City[];
};

// Helper function to get product stats using direct query
const getProductStats = async (productId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    // For now, return mock data since reviews table might not exist yet
    return { avg_rating: 0, total_reviews: 0 };
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return { avg_rating: 0, total_reviews: 0 };
  }
};

// Helper function to get shop stats using direct query
const getShopStats = async (shopId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    // For now, return mock data since reviews table might not exist yet
    return { avg_rating: 0, total_reviews: 0, is_verified: false };
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    return { avg_rating: 0, total_reviews: 0, is_verified: false };
  }
};

// Products for marketplace with enhanced filtering
export const getMarketplaceProducts = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  limit?: number;
}): Promise<Product[]> => {
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
    .eq('verification_status', 'approved')
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
  
  // Get ratings for each product and apply rating filter
  let productsWithRatings = await Promise.all(
    (data || []).map(async (product: any) => {
      const stats = await getProductStats(product.id);
      
      return {
        ...product,
        avg_rating: stats.avg_rating,
        total_reviews: stats.total_reviews,
        moq: product.moq || 1 // Ensure MOQ is included
      };
    })
  );

  // Apply rating filter
  if (filters?.min_rating) {
    productsWithRatings = productsWithRatings.filter(
      product => product.avg_rating >= filters.min_rating!
    );
  }
  
  return productsWithRatings as any[];
};

// Get single product with details and reviews
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
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
    .eq('id', id)
    .eq('is_active', true)
    .eq('verification_status', 'approved')
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  // Get company profile and product stats
  if (data?.shops?.owner_id) {
    const [companyProfileResult, productStats] = await Promise.all([
      supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', data.shops.owner_id)
        .single(),
      getProductStats(data.id)
    ]);
    
    if (companyProfileResult.data) {
      (data as any).shops.company_profiles = companyProfileResult.data;
    }
    
    (data as any).avg_rating = productStats.avg_rating;
    (data as any).total_reviews = productStats.total_reviews;

    // Ensure MOQ is included
    (data as any).moq = data.moq || 1;
  }
  
  return data as any;
};

// Shops for marketplace with verified badges
export const getMarketplaceShops = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  limit?: number;
}): Promise<Shop[]> => {
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

  // Get company profiles and shop stats separately for each shop
  const shopsWithProfilesAndStats = await Promise.all(
    (data || []).map(async (shop: any) => {
      const [companyProfileResult, shopStats] = await Promise.all([
        supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', shop.owner_id)
          .single(),
        getShopStats(shop.id)
      ]);
      
      return {
        ...shop,
        company_profiles: companyProfileResult.data || null,
        avg_rating: shopStats.avg_rating,
        total_reviews: shopStats.total_reviews,
        is_verified: shopStats.is_verified
      };
    })
  );
  
  return shopsWithProfilesAndStats as Shop[];
};

// Get single shop with details and stats
export const getShopById = async (id: string): Promise<Shop | null> => {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      *,
      cities (id, name, province)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching shop:', error);
    return null;
  }

  // Get company profile and shop stats
  if (data?.owner_id) {
    const [companyProfileResult, shopStats] = await Promise.all([
      supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', data.owner_id)
        .single(),
      getShopStats(data.id)
    ]);
    
    if (companyProfileResult.data) {
      (data as any).company_profiles = companyProfileResult.data;
    }
    
    (data as any).avg_rating = shopStats.avg_rating;
    (data as any).total_reviews = shopStats.total_reviews;
    (data as any).is_verified = shopStats.is_verified;
  }
  
  return data as any;
};

// Get products by shop for seller profile with ratings
export const getProductsByShopPublic = async (shopId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name)
    `)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching shop products:', error);
    return [];
  }
  
  // Get ratings for each product
  const productsWithRatings = await Promise.all(
    (data || []).map(async (product: any) => {
      const stats = await getProductStats(product.id);
      
      return {
        ...product,
        avg_rating: stats.avg_rating,
        total_reviews: stats.total_reviews,
        moq: product.moq || 1 // Ensure MOQ is included
      };
    })
  );
  
  return productsWithRatings as Product[];
};

// Company profiles
export const getCompanyProfile = async (userId: string): Promise<CompanyProfile | null> => {
  const { data, error } = await supabase
    .from('company_profiles')
    .select(`
      *,
      cities (id, name, province)
    `)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
  
  return data as CompanyProfile;
};

export const createCompanyProfile = async (profile: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyProfile> => {
  const { data, error } = await supabase
    .from('company_profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating company profile:', error);
    throw error;
  }
  
  return data as CompanyProfile;
};

export const updateCompanyProfile = async (userId: string, profile: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  const { data, error } = await supabase
    .from('company_profiles')
    .update(profile)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating company profile:', error);
    throw error;
  }
  
  return data as CompanyProfile;
};

// Inquiries
export const createInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at'>): Promise<Inquiry> => {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiry])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
  
  return data as Inquiry;
};

export const getInquiriesForSeller = async (): Promise<Inquiry[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      products (id, name, image)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching seller inquiries:', error);
    return [];
  }
  
  return data as Inquiry[];
};

export const getInquiriesForBuyer = async (): Promise<Inquiry[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      products (id, name, image)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching buyer inquiries:', error);
    return [];
  }
  
  return data as Inquiry[];
};

export const updateInquiryStatus = async (inquiryId: string, status: string): Promise<Inquiry> => {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', inquiryId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
  
  return data as Inquiry;
};
