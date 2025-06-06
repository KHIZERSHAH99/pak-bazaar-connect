
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from './security';

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    if (!validateEmail(email)) {
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase().trim())
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
  // Pakistani NTN validation (7 digits followed by dash and 1 digit)
  const ntnRegex = /^\d{7}-\d{1}$/;
  return ntnRegex.test(ntn.trim());
};

export const validateSTRN = (strn: string): boolean => {
  // Pakistani STRN validation (format varies, basic check for 11-15 digits)
  const strnRegex = /^\d{11,15}$/;
  return strnRegex.test(strn.replace(/[-\s]/g, ''));
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
