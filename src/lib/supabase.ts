// Re-export all the modules to maintain backward compatibility
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import * as authModule from './auth';
import * as shopsModule from './shops';
import * as productsModule from './products';
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
  getUserProfile
} = authModule;

export const {
  getShopsByOwner,
  getShopsByWholesaler,
  createShop,
  updateShop,
  getAllShops
} = shopsModule;

export const {
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct
} = productsModule;


export const {
  createOrder,
  getOrdersForWholesaler,
  getOrdersForSeller,
  updateOrderStatus,
  getWholesalerCommissions,
  getOrderById
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
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
  processPayment
} = paymentModule;

// --- Enhanced role management functions ---

// Fetch pending role requests for admin
export async function getRoleRequests() {
  try {
    const { data, error } = await supabase
      .from("role_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching role requests:', error);
    throw error;
  }
}

// Approve a role request by ID, and update user's profile role
export async function approveRoleRequest(requestId: string) {
  try {
    // 1. Get the request to know user_id, requested_role
    const { data: request, error: reqErr } = await supabase
      .from("role_requests")
      .select("user_id, requested_role")
      .eq("id", requestId)
      .maybeSingle();
    
    if (reqErr || !request) {
      throw reqErr || new Error("Role request not found");
    }

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

    // 4. Log the role approval
    const { logAuditEvent } = await import('./security/audit-enhanced');
    await logAuditEvent('role_request_approved', 'role_requests', requestId, null, {
      user_id: request.user_id,
      requested_role: request.requested_role,
      approved_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving role request:', error);
    throw error;
  }
}

// Create a role request
export async function createRoleRequest(requestedRole: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from("role_requests")
      .insert({
        user_id: user.id,
        requested_role: requestedRole,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Log the role request
    const { logAuditEvent } = await import('./security/audit-enhanced');
    await logAuditEvent('role_request_created', 'role_requests', data.id, null, {
      requested_role: requestedRole,
      created_at: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('Error creating role request:', error);
    throw error;
  }
}
