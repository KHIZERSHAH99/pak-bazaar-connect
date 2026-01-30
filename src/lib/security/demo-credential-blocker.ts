import { supabase } from '@/integrations/supabase/client';

// Pattern-based detection for demo/test credentials
// No hardcoded credentials - uses pattern matching instead
const DEMO_IDENTIFIER_PATTERNS = [
  /^test/i,
  /^demo/i,
  /^admin@test/i,
  /^user\d*@/i,
  /@test\.com$/i,
  /@example\.com$/i,
  /^0300{6,}/  // Repeated zeros pattern in phone
];

const isDevelopmentEnvironment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('127.0.0.1') ||
         window.location.hostname.includes('preview');
};

// Common weak password patterns to check
const WEAK_PASSWORD_PATTERNS = [
  /^password/i,
  /^123456/,
  /^admin/i,
  /^test/i,
  /^demo/i,
  /^user/i,
  /^qwerty/i,
  /^abc123/i,
  /^letmein/i
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
  
  // In development, allow any credentials
  if (isDevelopmentEnvironment()) {
    return { isBlocked: false };
  }

  // Block demo/test email patterns in production
  if (email) {
    const isTestEmail = DEMO_IDENTIFIER_PATTERNS.some(p => p.test(email));
    if (isTestEmail) {
      return {
        isBlocked: true,
        reason: 'Test/demo email patterns are not allowed in production',
        suggestions: [
          'Use your real email address',
          'Create a proper business account',
          'Contact support if you need assistance'
        ]
      };
    }
  }

  // Block demo phone number patterns in production
  if (phone) {
    const cleanPhone = phone.replace(/[\s\-+()]/g, '');
    const isTestPhone = DEMO_IDENTIFIER_PATTERNS.some(p => p.test(cleanPhone));
    if (isTestPhone) {
      return {
        isBlocked: true,
        reason: 'Test/demo phone number patterns are not allowed in production',
        suggestions: [
          'Use your real phone number',
          'Ensure you can receive SMS verification',
          'Use a Pakistani mobile number format'
        ]
      };
    }
  }

  // Block weak/demo passwords in production
  if (password) {
    // Check against common weak password patterns
    const isWeakPassword = WEAK_PASSWORD_PATTERNS.some(pattern => 
      pattern.test(password)
    ) || password.length < 8;
    
    if (isWeakPassword) {
      return {
        isBlocked: true,
        reason: 'This password is too weak for production use',
        suggestions: [
          'Create a strong password with at least 8 characters',
          'Include uppercase, lowercase, numbers, and symbols',
          'Avoid common words and patterns'
        ]
      };
    }
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
    // Use direct insert instead of RPC to avoid dependency on non-existent function
    await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // No user ID for blocked attempts
        event_type: event,
        new_values: {
          ...details,
          timestamp: new Date().toISOString(),
          ip_address: 'client-side', // We can't get real IP on client side
          user_agent: navigator.userAgent
        },
        table_name: 'authentication'
      });
  } catch (error) {
    console.warn('Failed to log credential security event:', error);
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