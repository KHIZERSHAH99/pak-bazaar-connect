
// Define all the types needed for our application
export type UserRole = 'admin' | 'wholesaler' | 'seller' | 'pending';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
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
  profile_image?: string;
  verification_status?: string;
  verification_notes?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  suspension_type?: string;
  suspended_until?: string;
  last_commission_payment?: string;
  last_order_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface City {
  id: string;
  name: string;
  province: string;
  created_at?: string;
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
  city_id?: string;
  created_at?: string;
  // Joined data
  cities?: City;
  company_profiles?: CompanyProfile;
  // Review data
  avg_rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_active: boolean;
  category_id?: string;
  moq?: number;
  verification_status: string;
  created_at?: string;
  // Joined data
  categories?: Category;
  shops?: Shop;
  // Review data
  avg_rating?: number;
  total_reviews?: number;
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
  city_id?: string;
  address: string;
  business_type: string;
  verification_status: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  cities?: City;
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
  status: string;
  created_at?: string;
  // Joined data
  products?: Product;
}

export interface Review {
  id: string;
  reviewer_id: string;
  shop_id?: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export type AdStatus = 'pending' | 'approved' | 'active' | 'rejected';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'jazzcash' | 'easypaisa';
export type CommissionStatus = 'pending' | 'paid';

export interface Ad {
  id: string;
  wholesaler_id: string;
  headline: string;
  image?: string;
  status: AdStatus;
  created_at?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  status: OrderStatus;
  commission_id?: string;
  payment_screenshot?: string;
  payment_method?: PaymentMethod;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  screenshot_uploaded_at?: string;
  confirmed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  delivered_at?: string;
  delivery_confirmed_by?: string;
  auto_delete_screenshot_at?: string;
  wholesaler_notes?: string;
  created_at?: string;
  // Joined data
  shops?: Shop;
  profiles?: Profile;
}

export interface PaymentMethodInfo {
  id: string;
  wholesaler_id: string;
  bank_name?: string;
  account_number?: string;
  account_title?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionRecord {
  id: string;
  wholesaler_id: string;
  order_id: string;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: CommissionStatus;
  paid_at?: string;
  created_at?: string;
  // Joined data
  orders?: Order;
  profiles?: Profile;
}

export interface OrderAction {
  id: string;
  order_id: string;
  user_id: string;
  action: 'created' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  // Joined data - make profiles optional to handle partial data
  profiles?: Partial<Profile>;
}

export interface WholesalerMonthlySales {
  total_orders: number;
  total_sales: number;
  pending_commission: number;
  paid_commission: number;
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
  status: RoleRequestStatus;
  created_at?: string;
}
