
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
  if (data.ntnNumber && !/^\d{7}-\d$/.test(data.ntnNumber)) {
    errors.push('NTN number must be in format XXXXXXX-X');
  }
  
  // Validate STRN number format if provided
  if (data.strnNumber && !/^\d{2}-\d{2}-\d{4}-\d{3}-\d{2}$/.test(data.strnNumber)) {
    errors.push('STRN number must be in format XX-XX-XXXX-XXX-XX');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};
