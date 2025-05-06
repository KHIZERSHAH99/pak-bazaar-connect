
// Re-export all the modules to maintain backward compatibility
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import * as authModule from './auth';
import * as shopsModule from './shops';
import * as productsModule from './products';
import * as adsModule from './ads';
import * as adminModule from './admin';
import * as ordersModule from './orders';
import * as chatModule from './chat';
import * as storageModule from './storage';

// Re-export the Supabase client
export const supabase = supabaseClient;

// Re-export all types
export { 
  UserRole,
  Profile,
  Shop,
  Product,
  Ad,
  Order,
  Commission,
  ChatMessage,
  RoleRequest
} from './types';

// Re-export all functions to maintain backward compatibility
export const {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getUserProfile,
  requestRoleChange
} = authModule;

export const {
  getShopsByOwner,
  createShop,
  getAllShops
} = shopsModule;

export const {
  getProductsByShop,
  createProduct
} = productsModule;

export const {
  getAdsByWholesaler,
  getActiveAds,
  createAd,
  getPendingAds,
  approveAd
} = adsModule;

export const {
  getPendingRoleRequests,
  approveRoleRequest
} = adminModule;

export const {
  createOrder,
  getOrdersForWholesaler,
  getSellerCommissions
} = ordersModule;

export const {
  saveChat,
  getChatHistory
} = chatModule;

export const {
  uploadImage
} = storageModule;
