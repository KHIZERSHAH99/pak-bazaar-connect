
import { supabase } from '@/integrations/supabase/client';

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
};
