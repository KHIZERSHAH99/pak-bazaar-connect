export interface SellerAddress {
  id: string;
  user_id: string;
  address_type: 'delivery' | 'billing' | 'return';
  is_default: boolean;
  label?: string;
  street_address: string;
  area?: string;
  city: string;
  province: string;
  postal_code: string;
  contact_name?: string;
  contact_phone?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingDetails {
  id: string;
  order_id: string;
  courier_name: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_label_url?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  shipping_cost: number;
  weight_kg?: number;
  dimensions?: string;
  package_count: number;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface City {
  id: string;
  province_id?: string;
  name: string;
  is_major?: boolean;
  created_at?: string;
  province?: string; // For backward compatibility
}