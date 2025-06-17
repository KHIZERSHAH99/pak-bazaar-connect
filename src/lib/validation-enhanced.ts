
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

// Enhanced email format validation
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Enhanced password validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { isValid: errors.length === 0, errors };
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

// Enhanced phone number validation for Pakistani format
export const validatePhoneFormat = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return false;
  
  const phoneRegex = /^(\+92|0)?3\d{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  return phoneRegex.test(cleanPhone);
};

// Enhanced postal code validation for Pakistan
export const validatePostalCodeFormat = (postalCode: string): boolean => {
  if (!postalCode || postalCode.trim() === '') return false;
  
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode.trim());
};

// Rewritten phone uniqueness check to avoid complex type inference
export const checkPhoneExists = async (phone: string, excludeUserId?: string): Promise<boolean> => {
  try {
    if (!phone || phone.trim() === '') return false;
    
    if (excludeUserId) {
      // Query with exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phone)
        .neq('id', excludeUserId)
        .limit(1);
      
      if (error) {
        console.error('Error checking phone:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    } else {
      // Query without exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phone)
        .limit(1);
      
      if (error) {
        console.error('Error checking phone:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    }
  } catch (error) {
    console.error('Phone check error:', error);
    return false;
  }
};

// Rewritten NTN uniqueness check to avoid complex type inference
export const checkNTNExists = async (ntn: string, excludeUserId?: string): Promise<boolean> => {
  try {
    if (!ntn || ntn.trim() === '') return false;
    
    if (excludeUserId) {
      // Query with exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('ntn_number', ntn)
        .neq('id', excludeUserId)
        .limit(1);
      
      if (error) {
        console.error('Error checking NTN:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    } else {
      // Query without exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('ntn_number', ntn)
        .limit(1);
      
      if (error) {
        console.error('Error checking NTN:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    }
  } catch (error) {
    console.error('NTN check error:', error);
    return false;
  }
};

// Rewritten STRN uniqueness check to avoid complex type inference
export const checkSTRNExists = async (strn: string, excludeUserId?: string): Promise<boolean> => {
  try {
    if (!strn || strn.trim() === '') return false;
    
    if (excludeUserId) {
      // Query with exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('strn_number', strn)
        .neq('id', excludeUserId)
        .limit(1);
      
      if (error) {
        console.error('Error checking STRN:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    } else {
      // Query without exclusion
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('strn_number', strn)
        .limit(1);
      
      if (error) {
        console.error('Error checking STRN:', error);
        return false;
      }
      
      return Boolean(data && data.length > 0);
    }
  } catch (error) {
    console.error('STRN check error:', error);
    return false;
  }
};
