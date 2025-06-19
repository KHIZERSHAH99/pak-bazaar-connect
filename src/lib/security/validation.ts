
// Enhanced input validation with Pakistani business-specific rules
export const validatePhoneNumber = (phone: string): boolean => {
  // Pakistani phone number format: +92XXXXXXXXXX or 03XXXXXXXXX
  const pakistaniPhoneRegex = /^(\+92|0)?[3][0-9]{9}$/;
  return pakistaniPhoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateNTN = (ntn: string): boolean => {
  // Pakistani NTN format: 7 digits followed by dash and 1 digit
  const ntnRegex = /^\d{7}-\d$/;
  return ntnRegex.test(ntn);
};

export const validateSTRN = (strn: string): boolean => {
  // Pakistani STRN format: Various formats, basic validation
  const strnRegex = /^\d{2}-\d{2}-\d{4}-\d{3}-\d{2}$/;
  return strnRegex.test(strn);
};

export const validatePostalCode = (postalCode: string): boolean => {
  // Pakistani postal code: 5 digits
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
};

export const validateMOQ = (moq: number): boolean => {
  return Number.isInteger(moq) && moq > 0 && moq <= 1000000;
};

export const validatePrice = (price: number): boolean => {
  return !isNaN(price) && price > 0 && price <= 999999999;
};

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 1000); // Limit length
};

export const sanitizeBusinessName = (name: string): string => {
  if (!name) return '';
  
  // Allow only alphanumeric, spaces, hyphens, and common business symbols
  return name
    .replace(/[^a-zA-Z0-9\s\-&.,()]/g, '')
    .trim()
    .slice(0, 100);
};

export const sanitizeDescription = (description: string): string => {
  if (!description) return '';
  
  // More permissive for descriptions but still safe
  return description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim()
    .slice(0, 2000);
};

// SQL injection prevention
export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\bDROP\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/gi,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bEXEC\b|\bEXECUTE\b|\bSP_\w+)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS prevention
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateAndSanitizeInput = (input: string, type: 'text' | 'business' | 'description' = 'text') => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }

  if (containsSQLInjection(input)) {
    throw new Error('Input contains potentially harmful content');
  }

  if (containsXSS(input)) {
    throw new Error('Input contains potentially harmful scripts');
  }

  switch (type) {
    case 'business':
      return sanitizeBusinessName(input);
    case 'description':
      return sanitizeDescription(input);
    default:
      return sanitizeInput(input);
  }
};
