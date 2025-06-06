
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

export const validateMOQ = (moq: number): boolean => {
  return moq > 0 && Number.isInteger(moq);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Pakistani phone number validation
  const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Authorization utilities
export const checkUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Role check error:', error);
    return null;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await checkUserRole();
  return role === 'admin';
};

export const isShopOwner = async (shopId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .single();

    if (error) {
      console.error('Error checking shop ownership:', error);
      return false;
    }

    return data.owner_id === user.id;
  } catch (error) {
    console.error('Shop ownership check error:', error);
    return false;
  }
};

// Secure operations with authorization checks
export const secureCreateShop = async (shopData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Validate input
  if (!shopData.name || !shopData.contact || !shopData.address) {
    throw new Error('Required fields missing');
  }

  if (!validatePhoneNumber(shopData.contact)) {
    throw new Error('Invalid phone number format');
  }

  // Sanitize inputs
  const sanitizedData = {
    ...shopData,
    name: sanitizeInput(shopData.name),
    contact: sanitizeInput(shopData.contact),
    address: sanitizeInput(shopData.address),
    owner_id: user.id
  };

  const { data, error } = await supabase
    .from('shops')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const secureCreateProduct = async (productData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Check shop ownership
  const ownsShop = await isShopOwner(productData.shop_id);
  if (!ownsShop) {
    throw new Error('Unauthorized: You can only add products to your own shops');
  }

  // Validate input
  if (!productData.name || !productData.price) {
    throw new Error('Product name and price are required');
  }

  if (productData.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  if (productData.moq && !validateMOQ(productData.moq)) {
    throw new Error('Invalid MOQ value');
  }

  // Sanitize inputs
  const sanitizedData = {
    ...productData,
    name: sanitizeInput(productData.name),
    description: productData.description ? sanitizeInput(productData.description) : null,
    verification_status: 'pending' // Always start as pending
  };

  const { data, error } = await supabase
    .from('products')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const secureCreateOrder = async (orderData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Validate that user is not ordering from their own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', orderData.shop_id)
    .single();

  if (shopError) throw shopError;

  if (shop.owner_id === user.id) {
    throw new Error('Cannot order from your own shop');
  }

  // Validate order data
  if (!orderData.total_amount || orderData.total_amount <= 0) {
    throw new Error('Invalid order amount');
  }

  const sanitizedData = {
    ...orderData,
    buyer_id: user.id,
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Rate limiting utility (client-side)
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const requests = rateLimitMap.get(key) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  return true;
};

// Audit logging
export const logSecurityEvent = async (event: string, details: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`Security Event: ${event}`, {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      details
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
