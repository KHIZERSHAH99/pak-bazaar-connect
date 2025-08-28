// Pakistani phone number utilities

export const validatePakistaniPhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // Valid Pakistani mobile formats:
  // 03XX-XXXXXXX (11 digits starting with 03)
  // Network codes: 300-399
  return /^03[0-9]{9}$/.test(cleanPhone);
};

export const normalizePakistaniPhone = (phone: string): string => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // Convert different formats to standard 03XX-XXXXXXX format
  if (/^923[0-9]{9}$/.test(cleanPhone)) {
    // From +92 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleanPhone.substring(2);
  } else if (/^3[0-9]{9}$/.test(cleanPhone)) {
    // From 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleanPhone;
  } else if (/^03[0-9]{9}$/.test(cleanPhone)) {
    // Already in correct format
    return cleanPhone;
  } else if (/^92[0-9]+$/.test(cleanPhone) && cleanPhone.length >= 12) {
    // Handle +923XXXXXXXXX without the leading +
    return '0' + cleanPhone.substring(2);
  }
  
  // For any other format, try to extract 11-digit number starting with 03
  const match = cleanPhone.match(/(?:0)?(3[0-9]{9})/);
  if (match) {
    return '0' + match[1];
  }
  
  // Return as-is if doesn't match expected patterns
  return cleanPhone;
};

export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePakistaniPhone(phone);
  if (normalized.length === 11 && normalized.startsWith('03')) {
    return `${normalized.substring(0, 4)}-${normalized.substring(4)}`;
  }
  return phone;
};

export const formatPhoneForInternational = (phone: string): string => {
  const normalized = normalizePakistaniPhone(phone);
  if (normalized.length === 11 && normalized.startsWith('03')) {
    return `+92${normalized.substring(1)}`;
  }
  return phone;
};