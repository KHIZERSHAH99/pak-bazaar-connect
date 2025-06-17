
import { supabase } from '@/integrations/supabase/client';

// Enhanced email validation that checks for any existing user
export const checkEmailExistsGlobal = async (email: string): Promise<boolean> => {
  try {
    if (!email || !email.includes('@')) {
      return false;
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Use raw query to avoid type inference issues
    const { data, error } = await supabase.rpc('get_user_role');
    
    // Fallback to direct table query with explicit typing
    const result = await supabase
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .limit(1);
    
    if (result.error) {
      console.error('Error checking email:', result.error);
      return false;
    }
    
    // Explicit type check to avoid inference issues
    const profiles = result.data as Array<{ email: string }> | null;
    return Boolean(profiles && profiles.length > 0);
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
};

// Enhanced phone number validation with uniqueness check
export const checkPhoneExists = async (phone: string, excludeUserId?: string): Promise<boolean> => {
  try {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    // Use explicit typing to avoid inference issues
    const result = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('phone_number', cleanPhone)
      .limit(1);
    
    if (result.error) {
      console.error('Error checking phone:', result.error);
      return false;
    }
    
    // Explicit type check
    const profiles = result.data as Array<{ phone_number: string }> | null;
    return Boolean(profiles && profiles.length > 0);
  } catch (error) {
    console.error('Phone check error:', error);
    return false;
  }
};

// Enhanced NTN validation with Pakistani format
export const validateNTNFormat = (ntn: string): boolean => {
  if (!ntn || ntn.trim() === '') return true; // Optional field
  
  const ntnRegex = /^\d{7}-\d{1}$/;
  const cleanNtn = ntn.trim();
  
  if (!ntnRegex.test(cleanNtn)) {
    return false;
  }
  
  // Check for invalid patterns
  const digits = cleanNtn.replace('-', '');
  const invalidPatterns = ['00000000', '12345678', '76543210', '11111111'];
  
  return !invalidPatterns.includes(digits);
};

// Enhanced STRN validation with Pakistani format
export const validateSTRNFormat = (strn: string): boolean => {
  if (!strn || strn.trim() === '') return true; // Optional field
  
  const strnRegex = /^\d{11,15}$/;
  const cleanStrn = strn.replace(/[\s-]/g, '');
  
  if (!strnRegex.test(cleanStrn)) {
    return false;
  }
  
  // Check for invalid patterns
  const invalidPatterns = ['11111111111', '12345678901', '00000000000', '99999999999'];
  
  return !invalidPatterns.some(pattern => cleanStrn.startsWith(pattern));
};

// Check NTN uniqueness
export const checkNTNExists = async (ntn: string, excludeUserId?: string): Promise<boolean> => {
  try {
    if (!ntn || ntn.trim() === '') return false;
    
    const cleanNtn = ntn.trim();
    
    // Use explicit typing to avoid inference issues
    const result = await supabase
      .from('profiles')
      .select('ntn_number')
      .eq('ntn_number', cleanNtn)
      .limit(1);
    
    if (result.error) {
      console.error('Error checking NTN:', result.error);
      return false;
    }
    
    // Explicit type check
    const profiles = result.data as Array<{ ntn_number: string }> | null;
    return Boolean(profiles && profiles.length > 0);
  } catch (error) {
    console.error('NTN check error:', error);
    return false;
  }
};

// Check STRN uniqueness
export const checkSTRNExists = async (strn: string, excludeUserId?: string): Promise<boolean> => {
  try {
    if (!strn || strn.trim() === '') return false;
    
    const cleanStrn = strn.replace(/[\s-]/g, '');
    
    // Use explicit typing to avoid inference issues
    const result = await supabase
      .from('profiles')
      .select('strn_number')
      .eq('strn_number', cleanStrn)
      .limit(1);
    
    if (result.error) {
      console.error('Error checking STRN:', result.error);
      return false;
    }
    
    // Explicit type check
    const profiles = result.data as Array<{ strn_number: string }> | null;
    return Boolean(profiles && profiles.length > 0);
  } catch (error) {
    console.error('STRN check error:', error);
    return false;
  }
};
