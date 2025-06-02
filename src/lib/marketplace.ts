
import { supabase } from '@/integrations/supabase/client';
import { Product, Shop, Category, City, CompanyProfile, Inquiry } from '@/lib/types';

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data;
};

// Cities
export const getCities = async () => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  
  return data;
};

// Products for marketplace
export const getMarketplaceProducts = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  limit?: number;
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (id, name),
      shops (id, name, city_id, cities (id, name, province))
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
  
  return data;
};

// Get single product with details
export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name),
      shops (
        id, 
        name, 
        contact, 
        address,
        city_id,
        cities (id, name, province),
        company_profiles (
          company_name,
          phone,
          whatsapp,
          description,
          logo
        )
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
  
  return data;
};

// Shops for marketplace
export const getMarketplaceShops = async (filters?: {
  category_id?: string;
  city_id?: string;
  search?: string;
  limit?: number;
}) => {
  let query = supabase
    .from('shops')
    .select(`
      *,
      cities (id, name, province),
      company_profiles (
        company_name,
        description,
        logo,
        phone,
        verification_status
      )
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
  
  return data;
};

// Get single shop with details
export const getShopById = async (id: string) => {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      *,
      cities (id, name, province),
      company_profiles (
        company_name,
        description,
        logo,
        phone,
        whatsapp,
        website,
        verification_status
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching shop:', error);
    return null;
  }
  
  return data;
};

// Get products by shop for seller profile
export const getProductsByShopPublic = async (shopId: string) => {
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
  
  return data;
};

// Company profiles
export const getCompanyProfile = async (userId: string) => {
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
  
  return data;
};

export const createCompanyProfile = async (profile: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('company_profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating company profile:', error);
    throw error;
  }
  
  return data;
};

export const updateCompanyProfile = async (userId: string, profile: Partial<CompanyProfile>) => {
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
  
  return data;
};

// Inquiries
export const createInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiry])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
  
  return data;
};

export const getInquiriesForSeller = async () => {
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
  
  return data;
};

export const getInquiriesForBuyer = async () => {
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
  
  return data;
};

export const updateInquiryStatus = async (inquiryId: string, status: 'pending' | 'responded' | 'closed') => {
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
  
  return data;
};
