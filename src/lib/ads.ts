
import { supabase } from '@/integrations/supabase/client';

export interface Ad {
  id: string;
  wholesaler_id: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  created_at: string;
}

export const createAd = async (adData: Omit<Ad, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('ads')
    .insert([adData])
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
  
  return data as Ad[];
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
  
  return data as Ad[];
};
