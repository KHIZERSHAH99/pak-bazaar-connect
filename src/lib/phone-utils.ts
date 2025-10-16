// Simple Pakistani phone validation utilities
// OTP system removed - using email verification only

export const validatePakistaniPhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const clean = phone.replace(/[^0-9]/g, '');
  
  // Check if it's a valid Pakistani mobile number (11 digits starting with 03)
  return /^03[0-9]{9}$/.test(clean);
};

export const normalizePakistaniPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const clean = phone.replace(/[^0-9]/g, '');
  
  // Convert various formats to standard 03XX-XXXXXXX format
  if (clean.startsWith('923')) {
    // From +92 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + clean.substring(2);
  } else if (clean.startsWith('3') && clean.length === 10) {
    // From 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + clean;
  } else if (clean.startsWith('03') && clean.length === 11) {
    // Already in correct format
    return clean;
  }
  
  // Return as-is if format doesn't match
  return clean;
};

export const formatPakistaniPhone = (phone: string): string => {
  const normalized = normalizePakistaniPhone(phone);
  
  // Format as 03XX-XXXXXXX
  if (normalized.length === 11 && normalized.startsWith('03')) {
    return `${normalized.substring(0, 4)}-${normalized.substring(4)}`;
  }
  
  return normalized;
};
