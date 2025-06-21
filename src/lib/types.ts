

export type UserRole = 'admin' | 'wholesaler' | 'seller' | 'pending';
export type OrderStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';
export type PaymentMethod = 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cod';
export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  phone_number?: string;
  business_name?: string;
  contact_name?: string;
  business_type?: string;
  ntn_number?: string;
  strn_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  industry?: string;
  years_in_business?: string;
  cnic_image?: string;
  selfie_image?: string;
  verification_status?: string;
  verification_notes?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  can_switch_roles?: boolean;
  last_role_switch?: string;
  role_switch_count?: number;
  profile_image?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  city_id?: string;
  commission_rate?: number;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category_id?: string;
  moq?: number;
  is_active: boolean;
  verification_status: string;
  created_at: string;
  categories?: Category;
  shops?: Shop;
}

export interface Ad {
  id: string;
  wholesaler_id: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  wholesaler_notes?: string;
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  screenshot_uploaded_at?: string;
  payment_screenshot?: string;
  commission_id?: string;
  shops?: Shop;
  profiles?: Profile;
}

export interface Commission {
  id: string;
  transaction_id: string;
  seller_id: string;
  sale_amount: number;
  commission_amount: number;
  payout_amount: number;
  created_at: string;
}

export interface CommissionRecord {
  id: string;
  wholesaler_id: string;
  order_id: string;
  sale_amount: number;
  commission_rate?: number;
  commission_amount: number;
  status?: CommissionStatus;
  paid_at?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  reply: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  province: string;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo?: string;
  description?: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: string;
  city_id?: string;
  business_type: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  message: string;
  quantity_needed?: number;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface PaymentMethodInfo {
  id: string;
  wholesaler_id: string;
  is_active: boolean;
  jazzcash_number?: string;
  easypaisa_number?: string;
  bank_name?: string;
  account_number?: string;
  account_title?: string;
  created_at: string;
  updated_at: string;
}

export interface WholesalerMonthlySales {
  month: string;
  year: number;
  total_sales: number;
  total_orders: number;
  commission_earned: number;
}

// Type guards for runtime validation
export const isValidUserRole = (role: any): role is UserRole => {
  return typeof role === 'string' && ['admin', 'wholesaler', 'seller', 'pending'].includes(role);
};

export const isValidOrderStatus = (status: any): status is OrderStatus => {
  return typeof status === 'string' && ['pending', 'confirmed', 'rejected', 'completed'].includes(status);
};

export const isValidPaymentMethod = (method: any): method is PaymentMethod => {
  return typeof method === 'string' && ['bank_transfer', 'jazzcash', 'easypaisa', 'cod'].includes(method);
};

export const validateProfile = (data: any): Profile | null => {
  if (!data || typeof data !== 'object') return null;
  
  const role = isValidUserRole(data.role) ? data.role : 'pending';
  
  return {
    id: data.id || '',
    email: data.email || '',
    role,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
    phone_number: data.phone_number,
    business_name: data.business_name,
    contact_name: data.contact_name,
    business_type: data.business_type,
    ntn_number: data.ntn_number,
    strn_number: data.strn_number,
    address: data.address,
    city: data.city,
    postal_code: data.postal_code,
    industry: data.industry,
    years_in_business: data.years_in_business,
    cnic_image: data.cnic_image,
    selfie_image: data.selfie_image,
    verification_status: data.verification_status,
    verification_notes: data.verification_notes,
    is_suspended: data.is_suspended,
    suspension_reason: data.suspension_reason,
    can_switch_roles: data.can_switch_roles,
    last_role_switch: data.last_role_switch,
    role_switch_count: data.role_switch_count,
    profile_image: data.profile_image
  };
};

export const validateOrder = (data: any): Order | null => {
  if (!data || typeof data !== 'object') return null;
  
  return {
    id: data.id || '',
    buyer_id: data.buyer_id || '',
    shop_id: data.shop_id || '',
    total_amount: Number(data.total_amount) || 0,
    status: isValidOrderStatus(data.status) ? data.status : 'pending',
    payment_method: isValidPaymentMethod(data.payment_method) ? data.payment_method : 'bank_transfer',
    buyer_name: data.buyer_name,
    buyer_phone: data.buyer_phone,
    buyer_address: data.buyer_address,
    wholesaler_notes: data.wholesaler_notes,
    created_at: data.created_at || new Date().toISOString(),
    confirmed_at: data.confirmed_at,
    rejected_at: data.rejected_at,
    screenshot_uploaded_at: data.screenshot_uploaded_at,
    payment_screenshot: data.payment_screenshot,
    commission_id: data.commission_id,
    shops: data.shops,
    profiles: data.profiles
  };
};

