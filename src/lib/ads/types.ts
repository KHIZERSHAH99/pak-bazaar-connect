
import { Database } from '@/integrations/supabase/types';

export type AdStatus = 'pending' | 'active' | 'rejected' | 'approved' | 'paused';

export interface Ad {
  id: string;
  wholesaler_id: string;
  headline: string;
  image?: string;
  status: AdStatus;
  created_at: string;
  // Enhanced fields for analytics
  current_spend?: number;
  total_orders?: number;
  budget_cap?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  is_auto_stopped?: boolean;
}

export interface CreateAdRequest {
  headline: string;
  image?: File;
  budget_cap?: number;
  campaign_end_date?: string;
}

export interface AdOrder {
  id: string;
  ad_id: string;
  buyer_id: string;
  order_amount: number;
  created_at: string;
}

export interface AdAnalytics {
  total_views: number;
  total_clicks: number;
  total_orders: number;
  total_revenue: number;
  conversion_rate: number;
  click_through_rate: number;
}

export type CreateAdData = Omit<Ad, 'id' | 'created_at' | 'status'>;
