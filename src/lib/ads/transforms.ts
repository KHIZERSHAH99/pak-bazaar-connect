
import { Ad } from './types';

// Helper function to transform database row to Ad interface
export const transformAd = (dbAd: any): Ad => ({
  id: dbAd.id,
  wholesaler_id: dbAd.wholesaler_id,
  headline: dbAd.headline,
  image: dbAd.image,
  status: dbAd.status,
  created_at: dbAd.created_at,
  budget_cap: dbAd.budget_cap || 0,
  campaign_start_date: dbAd.campaign_start_date || undefined,
  campaign_end_date: dbAd.campaign_end_date || undefined,
  current_spend: dbAd.current_spend || 0,
  total_orders: dbAd.total_orders || 0,
  is_auto_stopped: dbAd.is_auto_stopped || false
});
