import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  securityThreats: string[];
}

// Enhanced Pakistani business validation patterns
const PATTERNS = {
  phone: /^(\+92|0)?3\d{9}$/,
  ntn: /^\d{7}-\d{1}$/,
  strn: /^\d{11,15}$/,
  postalCode: /^\d{5}$/,
  cnic: /^\d{5}-\d{7}-\d{1}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Security threat detection
const detectSQLInjection = (input: string): boolean => {
  const patterns = [
    /(\bDROP\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/gi,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bEXEC\b|\bEXECUTE\b|\bSP_\w+)/gi
  ];
  return patterns.some(pattern => pattern.test(input));
};

const detectXSS = (input: string): boolean => {
  const patterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:(?!image\/)/gi
  ];
  return patterns.some(pattern => pattern.test(input));
};

const detectPathTraversal = (input: string): boolean => {
  const patterns = [/\.\./, /\/etc\/passwd/gi, /\/etc\/shadow/gi, /\\windows\\system32/gi];
  return patterns.some(pattern => pattern.test(input));
};

// Sanitization functions
const sanitizeText = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
};

const sanitizePhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Handle various Pakistani phone formats
  if (cleaned.startsWith('923') && cleaned.length === 12) {
    // +92 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleaned.substring(2);
  }
  if (cleaned.startsWith('92') && cleaned.length === 11) {
    // 92 3XX XXXXXXX to 03XX XXXXXXX  
    return '0' + cleaned.substring(2);
  }
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    // 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleaned;
  }
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    // Already in correct format
    return cleaned;
  }
  return cleaned;
};

const sanitizeNTN = (ntn: string): string => {
  if (!ntn) return '';
  const cleaned = ntn.replace(/[^\d-]/g, '');
  if (cleaned.length === 8 && !cleaned.includes('-')) {
    return cleaned.substring(0, 7) + '-' + cleaned.substring(7);
  }
  return cleaned;
};

const sanitizeSTRN = (strn: string): string => {
  return strn.replace(/[^\d]/g, '');
};

const sanitizePostalCode = (code: string): string => {
  return code.replace(/[^\d]/g, '');
};

const sanitizeBusinessName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9\s\-&.,()]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

export const validateAndSanitizeInput = async (
  input: string,
  type: 'text' | 'email' | 'phone' | 'ntn' | 'strn' | 'postalCode' | 'business' | 'description' = 'text',
  maxLength: number = 1000
): Promise<ValidationResult> => {
  const errors: string[] = [];
  const securityThreats: string[] = [];
  
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Input is required and must be text'],
      securityThreats: []
    };
  }

  // Check for security threats
  if (detectSQLInjection(input)) {
    securityThreats.push('SQL injection attempt detected');
  }
  if (detectXSS(input)) {
    securityThreats.push('Cross-site scripting (XSS) attempt detected');
  }
  if (detectPathTraversal(input)) {
    securityThreats.push('Path traversal attempt detected');
  }

  if (securityThreats.length > 0) {
    await logSecurityThreat('input_validation_threat_detected', {
      input_type: type,
      threats_detected: securityThreats,
      input_preview: input.substring(0, 50)
    });
  }

  // Sanitize based on type
  let sanitizedValue: string;
  
  switch (type) {
    case 'email':
      sanitizedValue = sanitizeEmail(input);
      if (!PATTERNS.email.test(sanitizedValue)) {
        errors.push('Invalid email format');
      }
      break;
      
    case 'phone':
      sanitizedValue = sanitizePhone(input);
      if (!PATTERNS.phone.test(sanitizedValue)) {
        errors.push('Invalid Pakistani phone number format (03XXXXXXXXX)');
      }
      break;
      
    case 'ntn':
      sanitizedValue = sanitizeNTN(input);
      if (sanitizedValue && !PATTERNS.ntn.test(sanitizedValue)) {
        errors.push('Invalid NTN format (XXXXXXX-X)');
      }
      break;
      
    case 'strn':
      sanitizedValue = sanitizeSTRN(input);
      if (sanitizedValue && !PATTERNS.strn.test(sanitizedValue)) {
        errors.push('Invalid STRN format (11-15 digits)');
      }
      break;
      
    case 'postalCode':
      sanitizedValue = sanitizePostalCode(input);
      if (!PATTERNS.postalCode.test(sanitizedValue)) {
        errors.push('Invalid postal code format (5 digits)');
      }
      break;
      
    case 'business':
      sanitizedValue = sanitizeBusinessName(input);
      if (sanitizedValue.length < 2) {
        errors.push('Business name must be at least 2 characters');
      }
      break;
      
    case 'description':
      // For descriptions, allow more content but sanitize
      sanitizedValue = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .trim();
      break;
      
    default:
      sanitizedValue = sanitizeText(input);
  }

  // Check length
  if (sanitizedValue.length > maxLength) {
    sanitizedValue = sanitizedValue.slice(0, maxLength);
    errors.push(`Input exceeds maximum length of ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0 && securityThreats.length === 0,
    sanitizedValue,
    errors,
    securityThreats
  };
};

const logSecurityThreat = async (eventType: string, details: any) => {
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_event_type: eventType,
      p_new_values: JSON.stringify(details)
    });
  } catch (error) {
    console.error('Failed to log security threat:', error);
  }
};

// Simplified field uniqueness checker
export const checkFieldUniqueness = async (
  field: string,
  value: string,
  excludeUserId?: string
): Promise<boolean> => {
  try {
    // Use direct queries to avoid TypeScript complexity
    if (field === 'email') {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', value)
        .limit(1);
      return Boolean(data && data.length > 0);
    }
    
    if (field === 'phone') {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone_number.eq.${value},normalized_phone.eq.${value}`)
        .limit(1);
      return Boolean(data && data.length > 0);
    }
    
    if (field === 'ntn') {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('ntn_number', value)
        .limit(1);
      return Boolean(data && data.length > 0);
    }
    
    if (field === 'strn') {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('strn_number', value)
        .limit(1);
      return Boolean(data && data.length > 0);
    }
    
    return false;
  } catch (error) {
    console.error(`${field} uniqueness check error:`, error);
    return false;
  }
};