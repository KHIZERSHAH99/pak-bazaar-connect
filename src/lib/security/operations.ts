
import { supabase } from '@/integrations/supabase/client';
import { validatePhoneNumber, sanitizeInput, validateAndSanitizeInput, validateNTN, validateSTRN, validatePostalCode } from './validation';
import { isShopOwner } from './authorization';
import { validateMOQ, validatePrice } from './validation';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from './rateLimit';

// Enhanced secure operations with comprehensive validation and rate limiting
export const secureCreateShop = async (shopData: any) => {
  // Rate limiting
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `create_shop_${clientId}`, 
    RATE_LIMITS.API_GENERAL.maxRequests, 
    RATE_LIMITS.API_GENERAL.windowMs
  );

  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Enhanced validation
  if (!shopData.name || !shopData.contact || !shopData.address || !shopData.postal_code) {
    throw new Error('Required fields missing: name, contact, address, postal_code');
  }

  if (!validatePhoneNumber(shopData.contact)) {
    throw new Error('Invalid Pakistani phone number format. Use format: 03XXXXXXXXX or +923XXXXXXXXX');
  }

  if (!validatePostalCode(shopData.postal_code)) {
    throw new Error('Invalid Pakistani postal code. Must be 5 digits.');
  }

  // Enhanced sanitization
  const sanitizedData = {
    name: validateAndSanitizeInput(shopData.name, 'business'),
    contact: sanitizeInput(shopData.contact),
    address: validateAndSanitizeInput(shopData.address, 'text'),
    postal_code: sanitizeInput(shopData.postal_code),
    owner_id: user.id,
    city_id: shopData.city_id || null,
    logo: shopData.logo || null
  };

  // Validate name length and format
  if (sanitizedData.name.length < 2 || sanitizedData.name.length > 100) {
    throw new Error('Shop name must be between 2 and 100 characters');
  }

  const { data, error } = await supabase
    .from('shops')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) {
    console.error('Shop creation error:', error);
    throw new Error(`Failed to create shop: ${error.message}`);
  }

  return data;
};

export const secureCreateProduct = async (productData: any) => {
  // Rate limiting
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `create_product_${clientId}`,
    RATE_LIMITS.API_GENERAL.maxRequests,
    RATE_LIMITS.API_GENERAL.windowMs
  );

  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Check shop ownership
  const ownsShop = await isShopOwner(productData.shop_id);
  if (!ownsShop) {
    throw new Error('Unauthorized: You can only add products to your own shops');
  }

  // Enhanced validation
  if (!productData.name || !productData.price) {
    throw new Error('Product name and price are required');
  }

  if (!validatePrice(productData.price)) {
    throw new Error('Invalid price. Must be a positive number less than 999,999,999');
  }

  if (productData.moq && !validateMOQ(productData.moq)) {
    throw new Error('Invalid MOQ. Must be a positive integer between 1 and 1,000,000');
  }

  // Enhanced sanitization
  const sanitizedData = {
    name: validateAndSanitizeInput(productData.name, 'business'),
    description: productData.description ? validateAndSanitizeInput(productData.description, 'description') : null,
    price: parseFloat(productData.price),
    moq: productData.moq ? parseInt(productData.moq) : 1,
    shop_id: productData.shop_id,
    category_id: productData.category_id || null,
    image: productData.image || null,
    is_active: productData.is_active !== false, // Default to true
    verification_status: 'pending' // Always start as pending
  };

  // Validate name length
  if (sanitizedData.name.length < 2 || sanitizedData.name.length > 200) {
    throw new Error('Product name must be between 2 and 200 characters');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) {
    console.error('Product creation error:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
};

export const secureCreateOrder = async (orderData: any) => {
  // Rate limiting
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `create_order_${clientId}`,
    RATE_LIMITS.API_GENERAL.maxRequests,
    RATE_LIMITS.API_GENERAL.windowMs
  );

  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Validate that user is not ordering from their own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', orderData.shop_id)
    .single();

  if (shopError) {
    console.error('Shop validation error:', shopError);
    throw new Error('Invalid shop specified');
  }

  if (shop.owner_id === user.id) {
    throw new Error('You cannot order from your own shop');
  }

  // Enhanced validation
  if (!orderData.total_amount || orderData.total_amount <= 0) {
    throw new Error('Invalid order amount. Must be greater than 0');
  }

  if (!validatePrice(orderData.total_amount)) {
    throw new Error('Invalid order amount. Must be less than 999,999,999');
  }

  const sanitizedData = {
    buyer_id: user.id,
    shop_id: orderData.shop_id,
    total_amount: parseFloat(orderData.total_amount),
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) {
    console.error('Order creation error:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data;
};

// Secure profile update with business data protection
export const secureUpdateProfile = async (profileData: any) => {
  // Rate limiting
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `update_profile_${clientId}`,
    RATE_LIMITS.API_GENERAL.maxRequests,
    RATE_LIMITS.API_GENERAL.windowMs
  );

  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Sanitize and validate business data
  const sanitizedData: any = {};

  if (profileData.business_name) {
    sanitizedData.business_name = validateAndSanitizeInput(profileData.business_name, 'business');
  }

  if (profileData.contact_name) {
    sanitizedData.contact_name = validateAndSanitizeInput(profileData.contact_name, 'text');
  }

  if (profileData.phone_number) {
    if (!validatePhoneNumber(profileData.phone_number)) {
      throw new Error('Invalid Pakistani phone number format');
    }
    sanitizedData.phone_number = sanitizeInput(profileData.phone_number);
  }

  if (profileData.ntn_number) {
    if (!validateNTN(profileData.ntn_number)) {
      throw new Error('Invalid NTN format. Use format: XXXXXXX-X');
    }
    sanitizedData.ntn_number = sanitizeInput(profileData.ntn_number);
  }

  if (profileData.strn_number) {
    if (!validateSTRN(profileData.strn_number)) {
      throw new Error('Invalid STRN format. Use format: XX-XX-XXXX-XXX-XX');
    }
    sanitizedData.strn_number = sanitizeInput(profileData.strn_number);
  }

  if (profileData.address) {
    sanitizedData.address = validateAndSanitizeInput(profileData.address, 'text');
  }

  if (profileData.city) {
    sanitizedData.city = validateAndSanitizeInput(profileData.city, 'text');
  }

  if (profileData.postal_code) {
    if (!validatePostalCode(profileData.postal_code)) {
      throw new Error('Invalid postal code. Must be 5 digits');
    }
    sanitizedData.postal_code = sanitizeInput(profileData.postal_code);
  }

  if (profileData.industry) {
    sanitizedData.industry = validateAndSanitizeInput(profileData.industry, 'text');
  }

  if (profileData.years_in_business) {
    sanitizedData.years_in_business = validateAndSanitizeInput(profileData.years_in_business, 'text');
  }

  // Update timestamp
  sanitizedData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(sanitizedData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Profile update error:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
};
