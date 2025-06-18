
import { supabase } from '@/integrations/supabase/client';

export const checkEmailExistsGlobal = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .limit(1);
    
    if (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkEmailExistsGlobal:', error);
    return false;
  }
};

export const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('phone_number', phoneNumber.trim())
      .limit(1);
    
    if (error) {
      console.error('Error checking phone existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkPhoneExists:', error);
    return false;
  }
};

export const checkNTNExists = async (ntnNumber: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('ntn_number')
      .eq('ntn_number', ntnNumber.trim())
      .limit(1);
    
    if (error) {
      console.error('Error checking NTN existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkNTNExists:', error);
    return false;
  }
};

export const checkSTRNExists = async (strnNumber: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('strn_number')
      .eq('strn_number', strnNumber.trim())
      .limit(1);
    
    if (error) {
      console.error('Error checking STRN existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkSTRNExists:', error);
    return false;
  }
};

export const validateNTNFormat = (ntnNumber: string): boolean => {
  const ntnRegex = /^\d{7}-\d$/;
  return ntnRegex.test(ntnNumber.trim());
};

export const validateSTRNFormat = (strnNumber: string): boolean => {
  const strnRegex = /^\d{11,15}$/;
  return strnRegex.test(strnNumber.trim().replace(/\D/g, ''));
};

export const validateBusinessData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.businessName || data.businessName.trim().length < 2) {
    errors.push('Business name must be at least 2 characters long');
  }
  
  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push('Contact name must be at least 2 characters long');
  }
  
  if (!data.phoneNumber || data.phoneNumber.trim().length < 10) {
    errors.push('Phone number must be at least 10 digits long');
  }
  
  if (!data.address || data.address.trim().length < 5) {
    errors.push('Address must be at least 5 characters long');
  }
  
  if (!data.city || data.city.trim().length < 2) {
    errors.push('City must be provided');
  }
  
  if (!data.postalCode || data.postalCode.trim().length < 4) {
    errors.push('Postal code must be at least 4 characters long');
  }
  
  // Validate NTN number format if provided
  if (data.ntnNumber && !validateNTNFormat(data.ntnNumber)) {
    errors.push('NTN number must be in format XXXXXXX-X');
  }
  
  // Validate STRN number format if provided
  if (data.strnNumber && !validateSTRNFormat(data.strnNumber)) {
    errors.push('STRN number must be 11-15 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};
