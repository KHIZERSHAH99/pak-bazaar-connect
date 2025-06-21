
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Profile, Shop, Product, Ad, Order, validateProfile } from '@/lib/types';

// Enhanced profile management with proper type safety
export const getEnhancedUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return validateProfile(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};

export const updateEnhancedUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data: validateProfile(data), error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Enhanced shop management
export const createEnhancedShop = async (shopData: {
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  city_id?: string;
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

export const getEnhancedShopsByOwner = async (ownerId: string) => {
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

// Enhanced product management
export const createEnhancedProduct = async (productData: {
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
      .insert({
        ...productData,
        is_active: true,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getEnhancedProductsByShop = async (shopId: string) => {
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

// Enhanced order management
export const createEnhancedOrder = async (orderData: {
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

    // Validate that user is not ordering from their own shop
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

// Enhanced ad management
export const createEnhancedAd = async (adData: {
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

// Enhanced role management
export const createEnhancedRoleRequest = async (requestedRole: UserRole) => {
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

export const getEnhancedPendingRoleRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('role_requests')
      .select(`
        *,
        profiles!role_requests_user_id_fkey(email, contact_name, business_name, role)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Enhanced file upload with proper bucket handling
export const uploadEnhancedImage = async (file: File, bucket: string, folder?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder || 'uploads'}/${Date.now()}.${fileExt}`;

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
