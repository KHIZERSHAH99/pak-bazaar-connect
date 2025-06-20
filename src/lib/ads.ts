
import { supabase } from '@/integrations/supabase/client';

export interface Ad {
  id: string;
  wholesaler_id: string;
  product_id?: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused';
  ad_type: string;
  budget_cap: number;
  daily_budget_limit?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  current_spend: number;
  total_orders: number;
  is_auto_stopped: boolean;
  tracking_token?: string;
  created_at: string;
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

  const { data, error } = await supabase
    .from('ads')
    .insert([{
      wholesaler_id: user.id,
      ...adData,
      status: 'pending',
      ad_type: 'cpo',
      current_spend: 0,
      total_orders: 0,
      is_auto_stopped: false,
    }])
    .select(`
      *,
      products:product_id(name, price, image)
    `)
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
    .select(`
      *,
      products:product_id(name, price, image)
    `)
    .eq('wholesaler_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const getActiveAds = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      products:product_id(name, price, image),
      shops:products!inner(shop_id)
    `)
    .eq('status', 'active')
    .eq('is_auto_stopped', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      products:product_id(name, price, image)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const approveAd = async (adId: string, isApproved: boolean = true) => {
  const status = isApproved ? 'approved' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ 
      status,
      campaign_start_date: isApproved ? new Date().toISOString() : undefined
    })
    .eq('id', adId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating ad status:', error);
    throw error;
  }
  
  return data as Ad;
};

export const getAdAnalytics = async (adId: string) => {
  const { data, error } = await supabase
    .from('ad_analytics')
    .select('*')
    .eq('ad_id', adId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching ad analytics:', error);
    return [];
  }
  
  return data as AdAnalytics[];
};

export const trackAdOrder = async (trackingToken: string, orderId: string, costCharged: number) => {
  const { data, error } = await supabase
    .from('ad_orders')
    .insert([{
      ad_id: trackingToken.replace('ad_', ''),
      order_id: orderId,
      tracking_token: trackingToken,
      cost_charged: costCharged
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error tracking ad order:', error);
    throw error;
  }
  
  // Update ad spend and order count
  await supabase.rpc('increment_ad_spend', {
    ad_id: trackingToken.replace('ad_', ''),
    spend_amount: costCharged
  });
  
  return data;
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
  
  return data as Ad;
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
  
  return data as Ad;
};
