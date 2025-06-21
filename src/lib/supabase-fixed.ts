
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Profile, Shop, Product, Ad, Order } from '@/lib/types';

// Enhanced authentication functions
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    return { user: null, session: null, error: error.message };
  }
};

export const signUpUser = async (email: string, password: string, role: UserRole) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { role }
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    return { user: null, session: null, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Profile management
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Cast the role to UserRole type to fix TypeScript error
    return {
      ...data,
      role: data.role as UserRole
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Shop management
export const createShop = async (shopData: {
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('shops')
      .insert({
        ...shopData,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getShopsByOwner = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Product management
export const createProduct = async (productData: {
  shop_id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  moq?: number;
  category_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getProductsByShop = async (shopId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getActiveProducts = async (limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops!inner(id, name, contact, address)
      `)
      .eq('is_active', true)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Ad management
export const createAd = async (adData: {
  headline: string;
  image?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ads')
      .insert({
        ...adData,
        wholesaler_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getAdsByWholesaler = async (wholesalerId: string) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('wholesaler_id', wholesalerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getActiveAds = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Order management
export const createOrder = async (orderData: {
  shop_id: string;
  total_amount: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_address?: string;
  payment_method?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is trying to order from their own shop
    const { data: shop } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', orderData.shop_id)
      .single();

    if (shop?.owner_id === user.id) {
      throw new Error('Cannot order from your own shop');
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        buyer_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getOrdersByBuyer = async (buyerId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!inner(id, name, contact, address)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getOrdersByWholesaler = async (wholesalerId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops!inner(id, name, contact, address, owner_id),
        profiles!orders_buyer_id_fkey(email, contact_name)
      `)
      .eq('shops.owner_id', wholesalerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
  try {
    const updates: any = { status };
    
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString();
    }
    
    if (notes) {
      updates.wholesaler_notes = notes;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Role management - simplified without calling non-existent functions
export const createRoleRequest = async (requestedRole: UserRole) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('role_requests')
      .insert({
        user_id: user.id,
        requested_role: requestedRole,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const switchBusinessRole = async (targetRole: UserRole) => {
  try {
    const { data, error } = await supabase.rpc('switch_business_role', {
      target_role: targetRole
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getPendingRoleRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('role_requests')
      .select(`
        *,
        profiles!role_requests_user_id_fkey(email, business_name, contact_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const approveRoleRequest = async (requestId: string) => {
  try {
    // First get the request details
    const { data: request, error: fetchError } = await supabase
      .from('role_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Update the user's role
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ role: request.requested_role })
      .eq('id', request.user_id);

    if (updateProfileError) throw updateProfileError;

    // Mark the request as approved
    const { data, error } = await supabase
      .from('role_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Chat functionality
export const saveChatMessage = async (message: string, reply: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        message,
        reply
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getChatHistory = async (limit: number = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Storage functions
export const uploadImage = async (file: File, bucket: string, folder?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder || 'images'}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { data: { path: fileName, publicUrl }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Admin functions
export const getPendingAds = async () => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        profiles!ads_wholesaler_id_fkey(email, business_name, contact_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const approveAd = async (adId: string) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'approved' })
      .eq('id', adId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const rejectAd = async (adId: string) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'rejected' })
      .eq('id', adId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
