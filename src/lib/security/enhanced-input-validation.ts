import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  securityThreats: string[];
}

// Enhanced Pakistani business validation patterns
const PAKISTANI_PATTERNS = {
  phone: /^(\+92|0)?3\d{9}$/,
  ntn: /^\d{7}-\d{1}$/,
  strn: /^\d{11,15}$/,
  postalCode: /^\d{5}$/,
  cnic: /^\d{5}-\d{7}-\d{1}$/
};

// Security threat patterns
const SECURITY_PATTERNS = {
  sqlInjection: [
    /(\bDROP\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/gi,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bEXEC\b|\bEXECUTE\b|\bSP_\w+)/gi
  ],
  xss: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:(?!image\/)/gi
  ],
  pathTraversal: [
    /\.\./g,
    /\/etc\/passwd/gi,
    /\/etc\/shadow/gi,
    /\\windows\\system32/gi
  ]
};

export const validateAndSanitizeInput = async (
  input: string,
  type: 'text' | 'email' | 'phone' | 'ntn' | 'strn' | 'postalCode' | 'business' | 'description' | 'html' = 'text',
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
  const threats = detectSecurityThreats(input);
  if (threats.length > 0) {
    securityThreats.push(...threats);
    await logSecurityThreat('input_validation_threat_detected', {
      input_type: type,
      threats_detected: threats,
      input_preview: input.substring(0, 50)
    });
  }

  // Sanitize based on type
  let sanitizedValue: string;
  
  switch (type) {
    case 'email':
      sanitizedValue = sanitizeEmail(input);
      if (!isValidEmail(sanitizedValue)) {
        errors.push('Invalid email format');
      }
      break;
      
    case 'phone':
      sanitizedValue = sanitizePhone(input);
      if (!PAKISTANI_PATTERNS.phone.test(sanitizedValue)) {
        errors.push('Invalid Pakistani phone number format (03XXXXXXXXX)');
      }
      break;
      
    case 'ntn':
      sanitizedValue = sanitizeNTN(input);
      if (sanitizedValue && !PAKISTANI_PATTERNS.ntn.test(sanitizedValue)) {
        errors.push('Invalid NTN format (XXXXXXX-X)');
      }
      break;
      
    case 'strn':
      sanitizedValue = sanitizeSTRN(input);
      if (sanitizedValue && !PAKISTANI_PATTERNS.strn.test(sanitizedValue)) {
        errors.push('Invalid STRN format (11-15 digits)');
      }
      break;
      
    case 'postalCode':
      sanitizedValue = sanitizePostalCode(input);
      if (!PAKISTANI_PATTERNS.postalCode.test(sanitizedValue)) {
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
      sanitizedValue = sanitizeDescription(input);
      break;
      
    case 'html':
      const htmlResult = sanitizeHtmlContent(input);
      sanitizedValue = htmlResult.sanitizedContent;
      if (htmlResult.securityThreats.length > 0) {
        securityThreats.push(...htmlResult.securityThreats);
      }
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

const detectSecurityThreats = (input: string): string[] => {
  const threats: string[] = [];
  
  // Check for SQL injection
  if (SECURITY_PATTERNS.sqlInjection.some(pattern => pattern.test(input))) {
    threats.push('SQL injection attempt detected');
  }
  
  // Check for XSS
  if (SECURITY_PATTERNS.xss.some(pattern => pattern.test(input))) {
    threats.push('Cross-site scripting (XSS) attempt detected');
  }
  
  // Check for path traversal
  if (SECURITY_PATTERNS.pathTraversal.some(pattern => pattern.test(input))) {
    threats.push('Path traversal attempt detected');
  }
  
  return threats;
};

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
  const cleaned = phone.replace(/[\s-+()]/g, '');
  if (cleaned.startsWith('92')) {
    return '0' + cleaned.substring(2);
  }
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return '0' + cleaned;
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

const sanitizeDescription = (description: string): string => {
  return DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror'],
    KEEP_CONTENT: true
  });
};

const sanitizeHtmlContent = (content: string) => {
  const securityThreats: string[] = [];
  
  // Check for dangerous content before sanitization
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      securityThreats.push(`Dangerous HTML pattern detected: ${pattern.source}`);
    }
  });

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'],
    KEEP_CONTENT: true
  });

  return { sanitizedContent, securityThreats };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

// Check uniqueness for sensitive fields
export const checkFieldUniqueness = async (
  field: 'email' | 'phone' | 'ntn' | 'strn',
  value: string,
  excludeUserId?: string
): Promise<boolean> => {
  try {
    const columnMap: Record<string, string> = {
      email: 'email',
      phone: 'phone_number',
      ntn: 'ntn_number',
      strn: 'strn_number'
    };

    const column = columnMap[field];
    if (!column) {
      console.error(`Invalid field type: ${field}`);
      return false;
    }

    let query = supabase
      .from('profiles')
      .select('id')
      .eq(column, value)
      .limit(1);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error(`Error checking ${field} uniqueness:`, error);
      return false;
    }
    
    return Boolean(data && data.length > 0);
  } catch (error) {
    console.error(`${field} uniqueness check error:`, error);
    return false;
  }
};