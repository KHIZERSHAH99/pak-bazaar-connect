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

// Products for marketplace with reviews and ratings
export const getMarketplaceProducts = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
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

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching marketplace products:', error);
    return [];
  }
  
  // Get ratings for each product
  const productsWithRatings = await Promise.all(
    (data || []).map(async (product: any) => {
      const { data: stats } = await supabase
        .rpc('get_product_stats', { product_uuid: product.id });
      
      return {
        ...product,
        avg_rating: stats?.[0]?.avg_rating || 0,
        total_reviews: stats?.[0]?.total_reviews || 0,
        moq: product.moq || 1 // Ensure MOQ is included
      };
    })
  );
  
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
    const [companyProfileResult, productStatsResult] = await Promise.all([
      supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', data.shops.owner_id)
        .single(),
      supabase
        .rpc('get_product_stats', { product_uuid: data.id })
    ]);
    
    if (companyProfileResult.data) {
      (data as any).shops.company_profiles = companyProfileResult.data;
    }
    
    if (productStatsResult.data) {
      (data as any).avg_rating = productStatsResult.data[0]?.avg_rating || 0;
      (data as any).total_reviews = productStatsResult.data[0]?.total_reviews || 0;
    }

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
      const [companyProfileResult, shopStatsResult] = await Promise.all([
        supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', shop.owner_id)
          .single(),
        supabase
          .rpc('get_shop_stats', { shop_uuid: shop.id })
      ]);
      
      return {
        ...shop,
        company_profiles: companyProfileResult.data || null,
        avg_rating: shopStatsResult.data?.[0]?.avg_rating || 0,
        total_reviews: shopStatsResult.data?.[0]?.total_reviews || 0,
        is_verified: shopStatsResult.data?.[0]?.is_verified || false
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
    const [companyProfileResult, shopStatsResult] = await Promise.all([
      supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', data.owner_id)
        .single(),
      supabase
        .rpc('get_shop_stats', { shop_uuid: data.id })
    ]);
    
    if (companyProfileResult.data) {
      (data as any).company_profiles = companyProfileResult.data;
    }
    
    if (shopStatsResult.data) {
      (data as any).avg_rating = shopStatsResult.data[0]?.avg_rating || 0;
      (data as any).total_reviews = shopStatsResult.data[0]?.total_reviews || 0;
      (data as any).is_verified = shopStatsResult.data[0]?.is_verified || false;
    }
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
      const { data: stats } = await supabase
        .rpc('get_product_stats', { product_uuid: product.id });
      
      return {
        ...product,
        avg_rating: stats?.[0]?.avg_rating || 0,
        total_reviews: stats?.[0]?.total_reviews || 0,
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
