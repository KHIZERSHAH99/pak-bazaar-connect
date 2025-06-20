
export interface Ad {
  id: string;
  wholesaler_id: string;
  product_id?: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused';
  ad_type?: string;
  budget_cap?: number;
  daily_budget_limit?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  current_spend?: number;
  total_orders?: number;
  is_auto_stopped?: boolean;
  tracking_token?: string;
  created_at: string;
  products?: {
    name: string;
    price: number;
    image?: string;
  };
}

export interface AdOrder {
  id: string;
  ad_id: string;
  order_id: string;
  tracking_token: string;
  cost_charged: number;
  created_at: string;
}

export interface AdAnalytics {
  id: string;
  ad_id: string;
  date: string;
  impressions: number;
  clicks: number;
  orders: number;
  spend: number;
}

export interface CreateAdData {
  product_id: string;
  headline: string;
  image?: string;
  budget_cap: number;
  daily_budget_limit?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
}
