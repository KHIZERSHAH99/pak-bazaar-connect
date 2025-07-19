
import { supabase } from '@/integrations/supabase/client';
import type { Ad } from './types';

export interface AdCreateRequest {
  headline: string;
  image?: File;
}

export const createAd = async (adData: AdCreateRequest): Promise<Ad> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    let imageUrl: string | null = null;

    // Upload image if provided
    if (adData.image) {
      const fileExt = adData.image.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad_images')
        .upload(fileName, adData.image);

      if (uploadError) {
        console.error('Error uploading ad image:', uploadError);
        throw new Error('Failed to upload ad image');
      }

      imageUrl = fileName; // Store just the filename, not the full URL
    }

    // Create ad record
    const { data, error } = await supabase
      .from('ads')
      .insert([
        {
          wholesaler_id: user.id,
          headline: adData.headline,
          image: imageUrl,
          status: 'pending',
          current_spend: 0,
          total_orders: 0,
          campaign_start_date: new Date().toISOString(),
          is_auto_stopped: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating ad:', error);
      throw new Error('Failed to create ad');
    }

    return data as Ad;
  } catch (error: any) {
    console.error('Error in createAd:', error);
    throw error;
  }
};

export const getWholesalerAds = async (): Promise<Ad[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('wholesaler_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesaler ads:', error);
      throw error;
    }

    return (data || []) as Ad[];
  } catch (error) {
    console.error('Error in getWholesalerAds:', error);
    throw error;
  }
};

export const getActiveAds = async (limit = 10): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching active ads:', error);
      throw error;
    }

    return (data || []) as Ad[];
  } catch (error) {
    console.error('Error in getActiveAds:', error);
    throw error;
  }
};

export const updateAdStatus = async (adId: string, status: 'approved' | 'rejected' | 'active' | 'paused'): Promise<Ad> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status })
      .eq('id', adId)
      .select()
      .single();

    if (error) {
      console.error('Error updating ad status:', error);
      throw new Error('Failed to update ad status');
    }

    return data as Ad;
  } catch (error: any) {
    console.error('Error in updateAdStatus:', error);
    throw error;
  }
};

export const getPendingAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending ads:', error);
      throw error;
    }

    return (data || []) as Ad[];
  } catch (error) {
    console.error('Error in getPendingAds:', error);
    throw error;
  }
};

export const deleteAd = async (adId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adId)
      .eq('wholesaler_id', user.id);

    if (error) {
      console.error('Error deleting ad:', error);
      throw new Error('Failed to delete ad');
    }
  } catch (error: any) {
    console.error('Error in deleteAd:', error);
    throw error;
  }
};

// Alias for AdManagementDashboard compatibility
export const getAdsByWholesaler = getWholesalerAds;

// Pause ad (set to paused status)
export const pauseAd = async (adId: string): Promise<Ad> => {
  return updateAdStatus(adId, 'paused');
};

// Resume ad (set to active status)
export const resumeAd = async (adId: string): Promise<Ad> => {
  return updateAdStatus(adId, 'active');
};
