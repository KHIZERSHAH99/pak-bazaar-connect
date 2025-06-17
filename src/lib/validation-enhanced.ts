import { supabase } from '@/integrations/supabase/client';

// Enhanced email validation that checks for any existing user
export const checkEmailExistsGlobal = async (email: string): Promise<boolean> => {
  try {
    if (!email || !email.includes('@')) {
      return false;
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Simple query to check if email exists
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .limit(1);
    
    if (error) {
      console.error('Error checking email:', error);
      return false;
    }
    
    return Boolean(data && data.length > 0);
  } catch (error) {
    console.error('Email check error:', error);
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

// Placeholder functions for phone, NTN, and STRN uniqueness checks
// These would need proper database columns to work
export const checkPhoneExists = async (phone: string, excludeUserId?: string): Promise<boolean> => {
  // Since phone_number column doesn't exist in profiles table, return false
  console.log('Phone uniqueness check not implemented - column does not exist');
  return false;
};

export const checkNTNExists = async (ntn: string, excludeUserId?: string): Promise<boolean> => {
  // Since ntn_number column doesn't exist in profiles table, return false
  console.log('NTN uniqueness check not implemented - column does not exist');
  return false;
};

export const checkSTRNExists = async (strn: string, excludeUserId?: string): Promise<boolean> => {
  // Since strn_number column doesn't exist in profiles table, return false
  console.log('STRN uniqueness check not implemented - column does not exist');
  return false;
};
