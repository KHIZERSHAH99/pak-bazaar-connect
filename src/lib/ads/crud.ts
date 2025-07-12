
import { supabase } from '@/integrations/supabase/client';
import { Ad, CreateAdData } from './types';
import { transformAd } from './transforms';

export const createAd = async (adData: CreateAdData) => {
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
  
  return transformAd(data);
};

export const getAdsByWholesaler = async (): Promise<Ad[]> => {
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
  
  return (data || []).map(transformAd);
};

export const getActiveAds = async (limit = 10): Promise<Ad[]> => {
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
  
  return (data || []).map(transformAd);
};

export const getPendingAds = async (): Promise<Ad[]> => {
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
  
  return (data || []).map(transformAd);
};

export const approveAd = async (adId: string, isApproved: boolean = true): Promise<Ad> => {
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
  
  return transformAd(data);
};

export const pauseAd = async (adId: string): Promise<Ad> => {
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
  
  return transformAd(data);
};

export const resumeAd = async (adId: string): Promise<Ad> => {
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
  
  return transformAd(data);
};

export const trackAdOrder = async (trackingToken: string, orderId: string, costCharged: number) => {
  try {
    // Get the ad by tracking token
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('id')
      .eq('tracking_token', trackingToken)
      .single();

    if (adError || !ad) {
      console.error('Ad not found for tracking token:', trackingToken);
      return { success: false, error: 'Ad not found' };
    }

    // Call the edge function to increment spend
    const { data, error } = await supabase.functions.invoke('increment-ad-spend', {
      body: {
        ad_id: ad.id,
        spend_amount: costCharged,
        order_id: orderId
      }
    });

    if (error) {
      console.error('Error tracking ad order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackAdOrder:', error);
    return { success: false, error: 'Failed to track ad order' };
  }
};
