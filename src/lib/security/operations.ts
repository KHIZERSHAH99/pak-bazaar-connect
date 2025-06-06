
import { supabase } from '@/integrations/supabase/client';
import { validatePhoneNumber, sanitizeInput } from './validation';
import { isShopOwner } from './authorization';
import { validateMOQ } from './validation';

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
