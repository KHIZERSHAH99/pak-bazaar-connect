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