/**
 * Authentication Input Detection and Validation
 * Properly identifies and validates email addresses and phone numbers
 */

export type InputType = 'email' | 'phone' | 'invalid';

export interface InputValidation {
  type: InputType;
  value: string;
  isValid: boolean;
  error?: string;
}

/**
 * Detect if input is an email or phone number
 * Ensures phone numbers don't contain @ symbols
 */
export function detectInputType(input: string): InputValidation {
  const trimmed = input.trim();
  
  // Check for email pattern
  if (trimmed.includes('@')) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (emailRegex.test(trimmed)) {
      return {
        type: 'email',
        value: trimmed.toLowerCase(),
        isValid: true
      };
    } else {
      return {
        type: 'invalid',
        value: trimmed,
        isValid: false,
        error: 'Please enter a valid email address'
      };
    }
  }
  
  // Check for phone pattern (no @ symbol allowed)
  const phoneDigits = trimmed.replace(/[\s\-\(\)\+]/g, '');
  
  // Pakistani phone number validation
  if (/^03[0-9]{9}$/.test(phoneDigits) || 
      /^923[0-9]{9}$/.test(phoneDigits) ||
      /^3[0-9]{9}$/.test(phoneDigits)) {
    
    // Normalize phone number
    let normalized = phoneDigits;
    if (/^923[0-9]{9}$/.test(phoneDigits)) {
      normalized = '0' + phoneDigits.substring(2);
    } else if (/^3[0-9]{9}$/.test(phoneDigits)) {
      normalized = '0' + phoneDigits;
    }
    
    return {
      type: 'phone',
      value: normalized,
      isValid: true
    };
  }
  
  // Check if it looks like a phone but invalid format
  if (/^[0-9\s\-\(\)\+]+$/.test(trimmed) && trimmed.replace(/[^0-9]/g, '').length > 0) {
    return {
      type: 'invalid',
      value: trimmed,
      isValid: false,
      error: 'Please enter a valid Pakistani phone number (03XX-XXXXXXX)'
    };
  }
  
  // Invalid input
  return {
    type: 'invalid',
    value: trimmed,
    isValid: false,
    error: 'Please enter a valid email address or phone number'
  };
}

/**
 * Format phone number for display
 */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
  }
  return phone;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate Pakistani phone number
 */
export function validatePakistaniPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return /^03[0-9]{9}$/.test(cleaned);
}