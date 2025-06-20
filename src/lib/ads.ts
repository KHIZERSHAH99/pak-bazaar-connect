
import { supabase } from '@/integrations/supabase/client';

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

  // For now, create with basic fields that exist in current schema
  const { data, error } = await supabase
    .from('ads')
    .insert([{
      wholesaler_id: user.id,
      headline: adData.headline,
      image: adData.image,
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  return data as Ad;
};

export const getAdsByWholesaler = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('wholesaler_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  // Transform data to match Ad interface with defaults
  return (data || []).map(ad => ({
    ...ad,
    ad_type: ad.ad_type || 'cpo',
    budget_cap: ad.budget_cap || 0,
    current_spend: ad.current_spend || 0,
    total_orders: ad.total_orders || 0,
    is_auto_stopped: ad.is_auto_stopped || false
  })) as Ad[];
};

export const getActiveAds = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
  
  // Transform data to match Ad interface with defaults
  return (data || []).map(ad => ({
    ...ad,
    ad_type: ad.ad_type || 'cpo',
    budget_cap: ad.budget_cap || 0,
    current_spend: ad.current_spend || 0,
    total_orders: ad.total_orders || 0,
    is_auto_stopped: ad.is_auto_stopped || false
  })) as Ad[];
};

export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  // Transform data to match Ad interface with defaults
  return (data || []).map(ad => ({
    ...ad,
    ad_type: ad.ad_type || 'cpo',
    budget_cap: ad.budget_cap || 0,
    current_spend: ad.current_spend || 0,
    total_orders: ad.total_orders || 0,
    is_auto_stopped: ad.is_auto_stopped || false
  })) as Ad[];
};

export const approveAd = async (adId: string, isApproved: boolean = true) => {
  const status = isApproved ? 'approved' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating ad status:', error);
    throw error;
  }
  
  return {
    ...data,
    ad_type: data.ad_type || 'cpo',
    budget_cap: data.budget_cap || 0,
    current_spend: data.current_spend || 0,
    total_orders: data.total_orders || 0,
    is_auto_stopped: data.is_auto_stopped || false
  } as Ad;
};

export const getAdAnalytics = async (adId: string) => {
  // For now, return empty array since table might not exist yet
  console.log('Analytics requested for ad:', adId);
  return [] as AdAnalytics[];
};

export const trackAdOrder = async (trackingToken: string, orderId: string, costCharged: number) => {
  // For now, just log the tracking attempt
  console.log('Ad order tracking:', { trackingToken, orderId, costCharged });
  return { success: true };
};

export const pauseAd = async (adId: string) => {
  const { data, error } = await supabase
    .from('ads')
    .update({ status: 'paused' })
    .eq('id', adId)
    .select()
    .single();
  
  if (error) {
    console.error('Error pausing ad:', error);
    throw error;
  }
  
  return {
    ...data,
    ad_type: data.ad_type || 'cpo',
    budget_cap: data.budget_cap || 0,
    current_spend: data.current_spend || 0,
    total_orders: data.total_orders || 0,
    is_auto_stopped: data.is_auto_stopped || false
  } as Ad;
};

export const resumeAd = async (adId: string) => {
  const { data, error } = await supabase
    .from('ads')
    .update({ status: 'active' })
    .eq('id', adId)
    .select()
    .single();
  
  if (error) {
    console.error('Error resuming ad:', error);
    throw error;
  }
  
  return {
    ...data,
    ad_type: data.ad_type || 'cpo',
    budget_cap: data.budget_cap || 0,
    current_spend: data.current_spend || 0,
    total_orders: data.total_orders || 0,
    is_auto_stopped: data.is_auto_stopped || false
  } as Ad;
};
