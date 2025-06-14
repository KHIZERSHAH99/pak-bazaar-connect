// Define all the types needed for our application
export type UserRole = 'admin' | 'wholesaler' | 'seller' | 'pending';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
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
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';

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
  created_at?: string;
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

// Add type aliases for ShopWithCity and ProductWithCategory
// These types are essentially the base Shop and Product types,
// used in contexts where their respective nested 'cities' or 'categories'
// are expected to be populated by a query.
export type ShopWithCity = Shop;
export type ProductWithCategory = Product;
