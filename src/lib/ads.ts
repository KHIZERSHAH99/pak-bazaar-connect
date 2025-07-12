
import { supabase } from '@/integrations/supabase/client';

// Re-export everything from modular ads library with explicit naming to avoid conflicts
export type { Ad as ModularAd, AdOrder, AdAnalytics, CreateAdData } from './ads/types';
export * from './ads/crud';
export { getAdAnalytics, getAdPerformanceSummary } from './ads/analytics';
export * from './ads/transforms';

// Legacy compatibility - keep existing exports
export interface LegacyAd {
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

// Helper function to transform database row to LegacyAd interface
const transformLegacyAd = (dbAd: any): LegacyAd => ({
  id: dbAd.id,
  wholesaler_id: dbAd.wholesaler_id,
  headline: dbAd.headline,
  image: dbAd.image,
  status: dbAd.status,
  created_at: dbAd.created_at,
  product_id: dbAd.product_id || undefined,
  ad_type: dbAd.ad_type || 'cpo',
  budget_cap: dbAd.budget_cap || 0,
  daily_budget_limit: dbAd.daily_budget_limit || 0,
  campaign_start_date: dbAd.campaign_start_date || undefined,
  campaign_end_date: dbAd.campaign_end_date || undefined,
  current_spend: dbAd.current_spend || 0,
  total_orders: dbAd.total_orders || 0,
  is_auto_stopped: dbAd.is_auto_stopped || false,
  tracking_token: dbAd.tracking_token || undefined,
  products: dbAd.products || undefined
});

// Legacy functions for backward compatibility
export const createAd = async (adData: {
  product_id: string;
  headline: string;
  image?: string;
  budget_cap: number;
  daily_budget_limit?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ads')
    .insert([{
      wholesaler_id: user.id,
      product_id: adData.product_id,
      headline: adData.headline,
      image: adData.image,
      status: 'pending',
      ad_type: 'cpo',
      budget_cap: adData.budget_cap || 0,
      daily_budget_limit: adData.daily_budget_limit || 0,
      campaign_start_date: adData.campaign_start_date,
      campaign_end_date: adData.campaign_end_date,
      current_spend: 0,
      total_orders: 0,
      is_auto_stopped: false
    }])
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .single();
  
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  return transformLegacyAd(data);
};

export const getAdsByWholesaler = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .eq('wholesaler_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  return (data || []).map(transformLegacyAd);
};

export const getActiveAds = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .eq('status', 'active')
    .eq('is_auto_stopped', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
  
  return (data || []).map(transformLegacyAd);
};

export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return (data || []).map(transformLegacyAd);
};

export const approveAd = async (adId: string, isApproved: boolean = true) => {
  const status = isApproved ? 'active' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId)
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .single();
  
  if (error) {
    console.error('Error updating ad status:', error);
    throw error;
  }
  
  return transformLegacyAd(data);
};

// Mock analytics for now since tables don't exist in TypeScript schema
export const getAdAnalyticsLegacy = async (adId: string) => {
  try {
    console.log('Getting legacy ad analytics for:', adId);
    return [] as AdAnalytics[];
  } catch (error) {
    console.error('Error in getAdAnalyticsLegacy:', error);
    return [] as AdAnalytics[];
  }
};

export const trackAdOrderLegacy = async (trackingToken: string, orderId: string, costCharged: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('increment-ad-spend', {
      body: {
        tracking_token: trackingToken,
        order_id: orderId,
        cost_charged: costCharged
      }
    });

    if (error) {
      console.error('Error tracking ad order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackAdOrderLegacy:', error);
    return { success: false, error: 'Failed to track ad order' };
  }
};

export const pauseAd = async (adId: string) => {
  const { data, error } = await supabase
    .from('ads')
    .update({ status: 'paused' })
    .eq('id', adId)
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .single();
  
  if (error) {
    console.error('Error pausing ad:', error);
    throw error;
  }
  
  return transformLegacyAd(data);
};

export const resumeAd = async (adId: string) => {
  const { data, error } = await supabase
    .from('ads')
    .update({ 
      status: 'active',
      is_auto_stopped: false 
    })
    .eq('id', adId)
    .select(`
      *,
      products (
        name,
        price,
        image
      )
    `)
    .single();
  
  if (error) {
    console.error('Error resuming ad:', error);
    throw error;
  }
  
  return transformLegacyAd(data);
};
