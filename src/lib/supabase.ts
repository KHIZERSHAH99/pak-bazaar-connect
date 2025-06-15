// Re-export all the modules to maintain backward compatibility
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import * as authModule from './auth';
import * as shopsModule from './shops';
import * as productsModule from './products';
import * as adsModule from './ads';
import * as ordersModule from './orders';
import * as chatModule from './chat';
import * as storageModule from './storage';
import * as marketplaceModule from './marketplace';
import * as paymentModule from './payment';

// Re-export the Supabase client
export const supabase = supabaseClient;

// Re-export all types - using export type for TS isolatedModules compatibility
export type { 
  UserRole,
  Profile,
  Shop,
  Product,
  Ad,
  Order,
  Commission,
  ChatMessage,
  Category,
  City,
  CompanyProfile,
  Inquiry
} from './types';

// Re-export all functions to maintain backward compatibility
export const {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getUserProfile,
  changeRole
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

// New marketplace functions
export const {
  getCategories,
  getCities,
  getMarketplaceProducts,
  getProductById,
  getMarketplaceShops,
  getShopById,
  getProductsByShopPublic,
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
  createInquiry,
  getInquiriesForSeller,
  getInquiriesForBuyer,
  updateInquiryStatus
} = marketplaceModule;

// New payment functions
export const {
  getPaymentMethods,
  calculateCommission,
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
  processPayment,
  getCommissionRates
} = paymentModule;

// Add these implementations at the bottom or appropriate location:

import { supabase } from "@/integrations/supabase/client";

// Fetch pending role requests for admin
export async function getRoleRequests() {
  const { data, error } = await supabase
    .from("role_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Approve a role request by ID, and update user's profile role
export async function approveRoleRequest(requestId: string) {
  // 1. Get the request to know user_id, requested_role
  const { data: request, error: reqErr } = await supabase
    .from("role_requests")
    .select("user_id, requested_role")
    .eq("id", requestId)
    .maybeSingle();
  if (reqErr || !request) throw reqErr || new Error("Role request not found");

  // 2. Set status to 'approved' on the role request
  const { error: updateErr } = await supabase
    .from("role_requests")
    .update({ status: "approved" })
    .eq("id", requestId);
  if (updateErr) throw updateErr;

  // 3. Change role in profiles table
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: request.requested_role })
    .eq("id", request.user_id);
  if (profileErr) throw profileErr;
}
