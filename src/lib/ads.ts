
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { Ad, AdStatus } from '@/lib/types';

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

// Define the interface for ads with profile information
export interface AdWithProfile extends Ad {
  wholesaler_profile?: {
    id: string;
    email: string;
  };
}

// Admin functions
export const getPendingAds = async () => {
  // This query needs to be fixed as there's no direct relation between ads and profiles
  // We need to join them manually
  const { data: ads, error: adsError } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'pending');
  
  if (adsError) {
    console.error('Error fetching pending ads:', adsError);
    return [];
  }

  // If there are no ads, return an empty array
  if (!ads || ads.length === 0) return [];

  // For each ad, fetch the wholesaler profile
  const adsWithProfiles: AdWithProfile[] = [];
  
  for (const ad of ads) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', ad.wholesaler_id)
      .single();
    
    if (profileError) {
      console.error(`Error fetching profile for ad ${ad.id}:`, profileError);
      // Add the ad without profile info
      adsWithProfiles.push({
        ...ad as Ad,
        wholesaler_profile: undefined
      });
    } else {
      // Add the ad with profile info
      adsWithProfiles.push({
        ...ad as Ad,
        wholesaler_profile: profileData
      });
    }
  }
  
  return adsWithProfiles;
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
