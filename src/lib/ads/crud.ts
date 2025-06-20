
import { supabase } from '@/integrations/supabase/client';
import { Ad, CreateAdData } from './types';
import { transformAd } from './transforms';

export const createAd = async (adData: CreateAdData) => {
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
  
  return transformAd(data);
};

export const getAdsByWholesaler = async (): Promise<Ad[]> => {
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
  
  return (data || []).map(transformAd);
};

export const getActiveAds = async (limit = 10): Promise<Ad[]> => {
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
  
  return (data || []).map(transformAd);
};

export const getPendingAds = async (): Promise<Ad[]> => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return (data || []).map(transformAd);
};

export const approveAd = async (adId: string, isApproved: boolean = true): Promise<Ad> => {
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
  
  return transformAd(data);
};

export const pauseAd = async (adId: string): Promise<Ad> => {
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
  
  return transformAd(data);
};

export const resumeAd = async (adId: string): Promise<Ad> => {
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
  
  return transformAd(data);
};
