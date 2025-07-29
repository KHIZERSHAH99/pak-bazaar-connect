
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

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_name: string;
  spec_value: string;
  created_at?: string;
}

export interface ProductPricingTier {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  created_at?: string;
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
  sample_available?: boolean;
  sample_price?: number;
  package_weight?: number;
  lead_time_days?: number;
  stock_quantity?: number;
  customization_available?: boolean;
  units_per_package?: number;
  brand?: string;
  model_number?: string;
  origin_country?: string;
  package_dimensions?: string;
  warranty_info?: string;
  certifications?: string[];
  colors_available?: string[];
  packaging_type?: string;
  created_at?: string;
  // Joined data
  categories?: Category;
  shops?: Shop;
  product_images?: ProductImage[];
  product_specifications?: ProductSpecification[];
  product_pricing_tiers?: ProductPricingTier[];
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
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'returned';
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
  // Enhanced tracking fields
  tracking_number?: string;
  carrier_name?: string;
  estimated_delivery?: string;
  processing_started_at?: string;
  packed_at?: string;
  shipped_at?: string;
  returned_at?: string;
  order_notes?: string;
  internal_notes?: string;
  priority_level?: number;
  requires_attention?: boolean;
  last_status_update?: string;
  created_at?: string;
  // Joined data
  shops?: Shop;
  profiles?: Profile;
  order_items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: any;
  custom_requirements?: string;
  created_at?: string;
  // Joined data
  products?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  previous_status?: string;
  changed_by?: string;
  notes?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  carrier_name?: string;
  created_at?: string;
  // Joined data
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
