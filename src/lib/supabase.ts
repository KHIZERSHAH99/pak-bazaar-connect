import { createClient } from '@supabase/supabase-js';

// Supabase project URL and anon key
const supabaseUrl = 'https://lljiqniebnmfbytbkjkv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsamlxbmllYm5tZmJ5dGJramsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4MTkyMCwiZXhwIjoxOTU4ODU3OTIwfQ.koZ0HHVE68ha3U8E06P0WGIl_TfA3MZcXWa7MdwrNcA';

// Create Supabase client with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Define all the types needed for our application
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
  commission_rate?: number;
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
  status: 'pending' | 'completed' | 'cancelled';
  commission_id?: string;
  created_at?: string;
}

export interface Commission {
  id: string;
  transaction_id: string;
  seller_id: string;
  sale_amount: number;
  commission_amount: number;
  payout_amount: number;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  reply: string;
  created_at?: string;
}

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth signin error:', error);
      throw error;
    }

    console.log('Signin successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth signup error:', error);
      throw error;
    }

    // The profile creation is now handled by the database trigger
    // so we don't need to explicitly create it here

    console.log('Signup successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

// Shop functions
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

export const createShop = async (shop: Omit<Shop, 'id' | 'owner_id' | 'created_at'>) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('shops')
    .insert([{ ...shop, owner_id: user.id }])
    .select();
  
  if (error) {
    console.error('Error creating shop:', error);
    throw error;
  }
  
  return data[0] as Shop;
};

// Product functions
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

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();
  
  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  
  return data[0] as Product;
};

// Ad functions
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

export const createAd = async (ad: Omit<Ad, 'id' | 'wholesaler_id' | 'status' | 'created_at'>) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('ads')
    .insert([{ ...ad, wholesaler_id: user.id, status: 'pending' }])
    .select();
  
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  return data[0] as Ad;
};

// Admin functions
export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const approveAd = async (adId: string, approve = true) => {
  const status = approve ? 'active' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId)
    .select();
  
  if (error) {
    console.error(`Error ${approve ? 'approving' : 'rejecting'} ad:`, error);
    throw error;
  }
  
  return data[0] as Ad;
};

export const getPendingRoleRequests = async () => {
  const { data, error } = await supabase
    .from('role_requests')
    .select('*, profiles(email)')
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error fetching pending role requests:', error);
    return [];
  }
  
  return data as (RoleRequest & { profiles: { email: string } })[];
};

export const approveRoleRequest = async (requestId: string, approve = true) => {
  if (!approve) {
    // Just update the request status to rejected
    const { error: updateRequestError } = await supabase
      .from('role_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    
    if (updateRequestError) {
      console.error('Error rejecting role request:', updateRequestError);
      throw updateRequestError;
    }
    
    return true;
  }

  // For approval, get the request to get the user id and requested role
  const { data: request, error: requestError } = await supabase
    .from('role_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  
  if (requestError || !request) {
    console.error('Error fetching role request:', requestError);
    throw requestError;
  }
  
  // Update the request status to approved
  const { error: updateRequestError } = await supabase
    .from('role_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  
  if (updateRequestError) {
    console.error('Error updating role request:', updateRequestError);
    throw updateRequestError;
  }
  
  // Update the user's role in their profile
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({ role: request.requested_role })
    .eq('id', request.user_id);
  
  if (updateProfileError) {
    console.error('Error updating user profile:', updateProfileError);
    throw updateProfileError;
  }
  
  return true;
};

// Role change request
export const requestRoleChange = async (requestedRole: UserRole) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Check if there's already a pending request
  const { data: existingRequests, error: checkError } = await supabase
    .from('role_requests')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending');
  
  if (checkError) {
    console.error('Error checking existing requests:', checkError);
    throw checkError;
  }
  
  if (existingRequests && existingRequests.length > 0) {
    throw new Error('You already have a pending role change request');
  }
  
  // Create new role request
  const { data, error } = await supabase
    .from('role_requests')
    .insert([{ user_id: user.id, requested_role: requestedRole, status: 'pending' }])
    .select();
  
  if (error) {
    console.error('Error creating role change request:', error);
    throw error;
  }
  
  return data[0] as RoleRequest;
};

// Orders
export const createOrder = async (shopId: string, totalAmount: number) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Get shop details to check if user is not ordering from own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single();
  
  if (shopError) {
    console.error('Error fetching shop info:', shopError);
    throw shopError;
  }
  
  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: user.id,
      shop_id: shopId,
      total_amount: totalAmount,
      status: 'pending'
    }])
    .select();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data[0] as Order;
};

export const getOrdersForWholesaler = async () => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);
  
  if (shopsError || !shops.length) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }
  
  const shopIds = shops.map(shop => shop.id);
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(email)')
    .in('shop_id', shopIds);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data as (Order & { profiles: { email: string } })[];
};

export const getSellerCommissions = async () => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('seller_id', user.id);
  
  if (error) {
    console.error('Error fetching commissions:', error);
    return [];
  }
  
  return data as Commission[];
};

// Chat functions
export const saveChat = async (message: string, reply: string) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('chat_history')
    .insert([{
      user_id: user.id,
      message,
      reply
    }])
    .select();
  
  if (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
  
  return data[0] as ChatMessage;
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
    console.error('Error getting chat history:', error);
    return [];
  }
  
  return data as ChatMessage[];
};

// File upload function
export const uploadImage = async (bucket: string, fileName: string, file: File) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const filePath = `${user.id}/${fileName}`;
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Seller specific functions
export const getAllShops = async () => {
  const { data, error } = await supabase
    .from('shops')
    .select('*');
  
  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
  
  return data as Shop[];
};
