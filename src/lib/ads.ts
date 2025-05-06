
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Ad } from '@/lib/types';

// Ad functions
export const getAdsByWholesaler = async () => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('wholesaler_id', user.id);
  
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const getActiveAds = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .limit(limit);
  
  if (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
  
  return data as Ad[];
};

export const createAd = async (ad: Omit<Ad, 'id' | 'wholesaler_id' | 'status' | 'created_at'>) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('ads')
    .insert([{ ...ad, wholesaler_id: user.id, status: 'pending' }])
    .select();
  
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  return data[0] as Ad;
};

// Admin functions
export const getPendingAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select('*, profiles:wholesaler_id(id, email)')
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error fetching pending ads:', error);
    return [];
  }
  
  return data as Array<Ad & { profiles: { id: string; email: string } }>;
};

export const approveAd = async (adId: string, approve = true) => {
  const status = approve ? 'active' : 'rejected';
  
  const { data, error } = await supabase
    .from('ads')
    .update({ status })
    .eq('id', adId)
    .select();
  
  if (error) {
    console.error(`Error ${approve ? 'approving' : 'rejecting'} ad:`, error);
    throw error;
  }
  
  return data[0] as Ad;
};
