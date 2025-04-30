
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lljiqniebnmfbytbkjkv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsamlxbmllYm5tZmJ5dGJramt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzODUxOTEsImV4cCI6MjAyOTk2MTE5MX0.ZM0v_SJFV7qDskk_LJ3-lq8bgarMdm8a09GcTgs6tBs';

// Define types for user profiles
export type UserRole = 'admin' | 'wholesaler' | 'seller' | 'pending';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Ad {
  id: string;
  wholesaler_id: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected';
  created_at?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  reply: string;
  created_at?: string;
}

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }

  if (data.user) {
    // Create a profile for the new user with a pending role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: 'pending',
      });
    
    if (profileError) {
      throw profileError;
    }
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

// Profile functions
export const updateProfile = async (profile: Partial<Profile>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Role request functions
export const requestRoleChange = async (requestedRole: UserRole) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('role_requests')
    .insert({
      user_id: user.id,
      requested_role: requestedRole,
      status: 'pending',
    })
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Admin functions
export const getPendingRoleRequests = async () => {
  const { data, error } = await supabase
    .from('role_requests')
    .select(`
      *,
      profiles:profiles(*)
    `)
    .eq('status', 'pending');
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const approveRoleRequest = async (requestId: string, approve: boolean) => {
  const status = approve ? 'approved' : 'rejected';
  
  const { data: request, error: requestError } = await supabase
    .from('role_requests')
    .update({ status })
    .eq('id', requestId)
    .select('user_id, requested_role')
    .single();

  if (requestError) {
    throw requestError;
  }

  if (approve && request) {
    // Update the user's role in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: request.requested_role })
      .eq('id', request.user_id);

    if (profileError) {
      throw profileError;
    }
  }

  return { success: true };
};

// Shop functions
export const createShop = async (shopData: Partial<Shop>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shops')
    .insert({
      ...shopData,
      owner_id: user.id,
    })
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getShopsByOwner = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id);
  
  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
  
  return data as Shop[];
};

export const getAllShops = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .range(from, to);
  
  if (error) {
    console.error('Error fetching all shops:', error);
    return [];
  }
  
  return data as Shop[];
};

// Product functions
export const createProduct = async (productData: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getProductsByShop = async (shopId: string) => {
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

// Ad functions
export const createAd = async (adData: Partial<Ad>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ads')
    .insert({
      ...adData,
      wholesaler_id: user.id,
      status: 'pending',
    })
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getAdsByWholesaler = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('wholesaler_id', user.id);
  
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const getActiveAds = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .limit(limit);
  
  if (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
  
  return data as Ad[];
};

// Admin ad functions
export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      profiles:profiles(*)
    `)
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return data;
};

export const approveAd = async (adId: string, approve: boolean) => {
  const status = approve ? 'active' : 'rejected';
  
  const { error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Order functions
export const createOrder = async (orderData: Partial<Order>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Check if buyer_id matches shop owner_id (prevent self-orders)
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', orderData.shop_id)
    .single();

  if (shopError) {
    throw shopError;
  }

  if (shop.owner_id === user.id) {
    throw new Error('Wholesalers cannot order from their own shop');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      buyer_id: user.id,
      status: 'pending',
    })
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getOrdersByBuyer = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shop:shops(*)
    `)
    .eq('buyer_id', user.id);
  
  if (error) {
    console.error('Error fetching buyer orders:', error);
    return [];
  }
  
  return data;
};

export const getOrdersForWholesaler = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get shops owned by the current user
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
    .from('orders')
    .select(`
      *,
      buyer:profiles(*)
    `)
    .in('shop_id', shopIds);
  
  if (error) {
    console.error('Error fetching wholesaler orders:', error);
    return [];
  }
  
  return data;
};

// File storage functions
export const uploadImage = async (bucket: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    throw error;
  }
  
  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl.publicUrl;
};

// Chat functions
export const saveChat = async (message: string, reply: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: user.id,
      message,
      reply,
    })
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getChatHistory = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
  
  return data as ChatMessage[];
};
