import { supabase } from '@/integrations/supabase/client';

export interface PasswordSecurityResult {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  errors: string[];
  suggestions: string[];
  isBreached?: boolean;
}

export const validatePasswordSecurity = async (password: string): Promise<PasswordSecurityResult> => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Minimum requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    suggestions.push('Add lowercase letters (a-z)');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    suggestions.push('Add uppercase letters (A-Z)');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    suggestions.push('Add numbers (0-9)');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Add special characters (!@#$%^&* etc.) for stronger security');
  } else {
    score += 1;
  }

  // Common password patterns to avoid
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /letmein/i,
    /pakistan/i,
    /karachi/i,
    /lahore/i,
    /islamabad/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns. Please choose a more unique password');
    score = Math.max(0, score - 2);
  }

  // Sequential or repeated characters
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating the same character multiple times');
    score = Math.max(0, score - 1);
  }

  // Check against HaveIBeenPwned API
  let isBreached = false;
  try {
    isBreached = await checkPasswordBreached(password);
    if (isBreached) {
      errors.push('This password has been found in data breaches. Please choose a different password');
      score = Math.max(0, score - 1);
    }
  } catch (error) {
    console.warn('Unable to check password breach status:', error);
  }

  // Additional security suggestions
  if (score < 4) {
    if (password.length < 12) {
      suggestions.push('Consider using a longer password (12+ characters)');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      suggestions.push('Add special characters for better security');
    }
  }

  const result = {
    isValid: errors.length === 0 && score >= 3,
    score: Math.min(4, score),
    errors,
    suggestions,
    isBreached
  };

  // Log password security events
  if (!result.isValid) {
    await logPasswordSecurityEvent('weak_password_attempted', {
      score,
      errors_count: errors.length,
      is_breached: isBreached
    });
  }

  return result;
};

export const checkPasswordBreached = async (password: string): Promise<boolean> => {
  try {
    // Use HaveIBeenPwned API to check if password has been breached
    const sha1Hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(sha1Hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      // If API is down, don't block the user
      return false;
    }
    
    const hashes = await response.text();
    return hashes.includes(suffix);
  } catch (error) {
    console.error('Error checking password breach:', error);
    // If check fails, don't block the user
    return false;
  }
};

export const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const logPasswordSecurityEvent = async (
  event: 'weak_password_attempted' | 'breached_password_attempted' | 'strong_password_created',
  details: Record<string, any> = {}
) => {
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_event_type: event,
      p_new_values: JSON.stringify(details)
    });
  } catch (error) {
    console.error('Failed to log password security event:', error);
  }
};