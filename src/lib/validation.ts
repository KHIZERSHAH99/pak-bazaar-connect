
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

// Enhanced validation functions with comprehensive Pakistani business rules
export const validateBusinessName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && !/^\d+$/.test(trimmed);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && Number.isFinite(price) && price <= 10000000; // Max 10M PKR
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
  if (digits === '00000000' || digits === '12345678' || digits === '76543210') {
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
  if (invalidPatterns.some(pattern => cleanStrn.startsWith(pattern))) {
    return false;
  }
  
  return true;
};

export const validateURL = (url: string): boolean => {
  try {
    const validUrl = new URL(url);
    return ['http:', 'https:'].includes(validUrl.protocol);
  } catch {
    return false;
  }
};

// Phone number validation for Pakistan
export const validatePakistaniPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+92|0)?3[0-9]{2}[0-9]{7}$/;
  const cleanPhone = phone.replace(/[-\s]/g, '');
  return phoneRegex.test(cleanPhone);
};

// Comprehensive validation for business data
export const validateCompleteBusinessData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateBusinessName(data.business_name || '')) {
    errors.push('Business name must be 2-100 characters and not just numbers');
  }
  
  if (data.phone_number && !validatePakistaniPhone(data.phone_number)) {
    errors.push('Please provide a valid Pakistani phone number');
  }
  
  if (data.postal_code && !validatePostalCode(data.postal_code)) {
    errors.push('Postal code must be exactly 5 digits');
  }
  
  if (data.ntn_number && !validateNTN(data.ntn_number)) {
    errors.push('NTN must be in format XXXXXXX-X');
  }
  
  if (data.strn_number && !validateSTRN(data.strn_number)) {
    errors.push('STRN must be 11-15 digits');
  }
  
  if (data.website && !validateURL(data.website)) {
    errors.push('Please provide a valid website URL');
  }
  
  return { isValid: errors.length === 0, errors };
};
