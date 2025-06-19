
import { supabase } from '@/integrations/supabase/client';

// Enhanced email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const checkEmailExists = async (email: string, excludeRole?: string): Promise<boolean> => {
  try {
    if (!validateEmail(email)) {
      return false;
    }

    let query = supabase
      .from('profiles')
      .select('email, role')
      .eq('email', email.toLowerCase().trim());
    
    if (excludeRole) {
      query = query.neq('role', excludeRole);
    }

    const { data, error } = await query;
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
};

export const validateMOQ = (moq: number): boolean => {
  return moq > 0 && Number.isInteger(moq);
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

// Enhanced validation functions
export const validateBusinessName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && Number.isFinite(price);
};

export const validatePostalCode = (code: string): boolean => {
  // Pakistani postal code validation (5 digits)
  const postalRegex = /^\d{5}$/;
  return postalRegex.test(code.trim());
};

export const validateNTN = (ntn: string): boolean => {
  // Pakistani NTN validation - must be exactly 7 digits followed by dash and 1 digit
  const ntnRegex = /^\d{7}-\d{1}$/;
  const cleanNtn = ntn.trim();
  
  if (!ntnRegex.test(cleanNtn)) {
    return false;
  }
  
  // Additional validation: check if it's not all zeros or sequential numbers
  const digits = cleanNtn.replace('-', '');
  if (digits === '0000000' || digits === '1234567' || digits === '7654321') {
    return false;
  }
  
  return true;
};

export const validateSTRN = (strn: string): boolean => {
  // Pakistani STRN validation - must be 11-15 digits, no sequential or repeated patterns
  const strnRegex = /^\d{11,15}$/;
  const cleanStrn = strn.replace(/[-\s]/g, '');
  
  if (!strnRegex.test(cleanStrn)) {
    return false;
  }
  
  // Check for invalid patterns
  const invalidPatterns = ['11111111111', '12345678901', '00000000000'];
  if (invalidPatterns.includes(cleanStrn.substring(0, 11))) {
    return false;
  }
  
  return true;
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
