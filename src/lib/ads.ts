
import { supabase } from '@/integrations/supabase/client';
import type { Ad, AdOrder, AdAnalytics, CreateAdData } from './ads/types';

// Re-export types properly
export type { Ad, AdOrder, AdAnalytics, CreateAdData } from './ads/types';
export * from './ads/crud';
export { getAdAnalytics, getAdPerformanceSummary } from './ads/analytics';
export * from './ads/transforms';

// Legacy functions for backward compatibility
export const createAd = async (adData: {
  headline: string;
  image?: string;
  budget_cap: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ads')
    .insert([{
      wholesaler_id: user.id,
      headline: adData.headline,
      image: adData.image,
      status: 'pending'
    }])
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to create ad - no data returned');
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
  
  return (data || []) as Ad[];
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
  
  return (data || []) as Ad[];
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
  
  return (data || []) as Ad[];
};

export const approveAd = async (adId: string, isApproved: boolean = true) => {
  const status = isApproved ? 'active' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error updating ad status:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Ad not found or update failed');
  }
  
  return data as Ad;
};

// Mock analytics for now since tables don't exist in TypeScript schema
export const getAdAnalyticsLegacy = async (adId: string): Promise<AdAnalytics[]> => {
  try {
    console.log('Getting legacy ad analytics for:', adId);
    return [];
  } catch (error) {
    console.error('Error in getAdAnalyticsLegacy:', error);
    return [];
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
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error pausing ad:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Ad not found or pause failed');
  }
  
  return data as Ad;
};

export const resumeAd = async (adId: string) => {
  const { data, error } = await supabase
    .from('ads')
    .update({ 
      status: 'active'
    })
    .eq('id', adId)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error resuming ad:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Ad not found or resume failed');
  }
  
  return data as Ad;
};
