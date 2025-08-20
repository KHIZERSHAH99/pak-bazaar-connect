import { supabase } from '@/integrations/supabase/client';

// Demo credentials that should be blocked in production
const DEMO_CREDENTIALS = [
  'admin@test.com',
  'wholesaler1@test.com',
  'seller1@test.com',
  'test@example.com',
  'demo@test.com',
  'admin@demo.com',
  'user@test.com'
];

const DEMO_PHONES = [
  '03000000000',
  '03111111111',
  '03222222222',
  '03333333333',
  '03444444444',
  '03555555555'
];

const WEAK_PASSWORDS = [
  'password',
  '123456',
  'admin',
  'test',
  'demo',
  'user'
];

export interface SecurityCheckResult {
  isBlocked: boolean;
  reason?: string;
  suggestions?: string[];
}

export const checkDemoCredentialSecurity = (
  email?: string,
  phone?: string,
  password?: string
): SecurityCheckResult => {
  const suggestions: string[] = [];
  
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('preview');
  
  // In development, allow demo credentials
  if (isDevelopment) {
    return { isBlocked: false };
  }

  // Block demo emails in production
  if (email && DEMO_CREDENTIALS.includes(email.toLowerCase())) {
    return {
      isBlocked: true,
      reason: 'Demo credentials are not allowed in production',
      suggestions: [
        'Use your real email address',
        'Create a proper business account',
        'Contact support if you need assistance'
      ]
    };
  }

  // Block demo phone numbers in production
  if (phone && DEMO_PHONES.includes(phone.replace(/[\s-+()]/g, ''))) {
    return {
      isBlocked: true,
      reason: 'Demo phone numbers are not allowed in production',
      suggestions: [
        'Use your real phone number',
        'Ensure you can receive SMS verification',
        'Use a Pakistani mobile number format'
      ]
    };
  }

  // Block weak/demo passwords in production
  if (password && WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return {
      isBlocked: true,
      reason: 'Demo passwords are not allowed in production',
      suggestions: [
        'Create a strong password with at least 8 characters',
        'Include uppercase, lowercase, numbers, and symbols',
        'Avoid common words and patterns'
      ]
    };
  }

  // Check for test/demo patterns in email
  if (email) {
    const testPatterns = [/test/i, /demo/i, /example/i, /fake/i, /temp/i];
    if (testPatterns.some(pattern => pattern.test(email))) {
      suggestions.push('Consider using your real business email for better verification');
    }
  }

  return { 
    isBlocked: false, 
    suggestions: suggestions.length > 0 ? suggestions : undefined 
  };
};

export const logCredentialSecurityEvent = async (
  event: 'demo_credential_blocked' | 'suspicious_credential_attempt',
  details: {
    email?: string;
    phone?: string;
    reason?: string;
    userAgent?: string;
  }
) => {
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: null, // No user ID for blocked attempts
      p_event_type: event,
      p_new_values: JSON.stringify({
        ...details,
        timestamp: new Date().toISOString(),
        ip_address: 'client-side', // We can't get real IP on client side
        user_agent: navigator.userAgent
      })
    });
  } catch (error) {
    console.error('Failed to log credential security event:', error);
  }
};

// Additional security checks for business registration
export const validateBusinessCredentials = async (formData: {
  email: string;
  phone_number: string;
  business_name: string;
  contact_name: string;
}): Promise<SecurityCheckResult> => {
  const { email, phone_number, business_name, contact_name } = formData;
  
  // Check basic demo credential blocking
  const basicCheck = checkDemoCredentialSecurity(email, phone_number);
  if (basicCheck.isBlocked) {
    return basicCheck;
  }

  // Additional business-specific validations
  const businessPatterns = [/test\s*business/i, /demo\s*company/i, /fake\s*corp/i];
  if (businessPatterns.some(pattern => pattern.test(business_name))) {
    await logCredentialSecurityEvent('suspicious_credential_attempt', {
      email,
      phone: phone_number,
      reason: 'Suspicious business name pattern detected'
    });
    
    return {
      isBlocked: false, // Don't block, but warn
      suggestions: [
        'Please use your real business name',
        'This helps build trust with your customers',
        'Accurate business information is required for verification'
      ]
    };
  }

  // Check for suspicious contact names
  const namePatterns = [/test\s*user/i, /demo\s*user/i, /admin/i, /fake/i];
  if (namePatterns.some(pattern => pattern.test(contact_name))) {
    return {
      isBlocked: false,
      suggestions: [
        'Please use your real name as contact person',
        'This information may be used for business verification'
      ]
    };
  }

  return { isBlocked: false };
};

// Environment detection utility
export const getEnvironmentType = (): 'development' | 'staging' | 'production' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'development';
  }
  
  if (hostname.includes('preview') || hostname.includes('staging')) {
    return 'staging';
  }
  
  return 'production';
};

// Security configuration based on environment
export const getSecurityConfig = () => {
  const env = getEnvironmentType();
  
  return {
    allowDemoCredentials: env === 'development',
    enforceStrictValidation: env === 'production',
    enableSecurityLogging: env !== 'development',
    requireRealData: env === 'production'
  };
};