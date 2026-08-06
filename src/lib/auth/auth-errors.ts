import { toast } from '@/hooks/use-toast';
import { validatePakistaniPhone } from './phone-utils';

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  originalError?: any;
}

// Comprehensive error message mapping for Supabase auth errors
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Signup errors
  'invalid_email': 'Please enter a valid email address (e.g., example@email.com)',
  'weak_password': 'Password must be at least 6 characters long and include both letters and numbers',
  'user_already_registered': 'An account with this email/phone already exists. Please sign in instead',
  'email_address_invalid': 'The email address format is invalid. Please check and try again',
  'email_not_confirmed': 'Please check your email and confirm your account before signing in',
  
  // Login errors
  'invalid_credentials': 'Incorrect email/phone or password. Please check and try again',
  'user_not_found': 'No account found with these credentials. Please sign up first',
  'invalid_password': 'Incorrect password. Please try again or reset your password',
  'invalid_grant': 'Email or password is incorrect. Please check your credentials',
  
  // Phone number specific errors
  'invalid_phone': 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)',
  'phone_not_verified': 'Please verify your phone number first',
  'invalid_phone_format': 'Phone number must start with 03 and be 11 digits long',
  'phone_already_exists': 'This phone number is already registered. Please sign in instead',
  
  // Password validation errors
  'password_too_short': 'Password must be at least 6 characters long',
  'password_too_weak': 'Password is too weak. Include uppercase, lowercase, and numbers',
  'passwords_dont_match': 'Passwords do not match. Please ensure both fields are identical',
  'password_no_number': 'Password must contain at least one number',
  'password_no_letter': 'Password must contain at least one letter',
  
  // Role and permission errors
  'role_not_allowed': 'You are not authorized to access this role',
  'account_suspended': 'Your account has been suspended. Please contact support',
  'pending_approval': 'Your account is pending approval. Please wait for admin confirmation',
  
  // Rate limiting
  'too_many_requests': 'Too many attempts. Please wait a minute before trying again',
  'rate_limit_exceeded': 'You have exceeded the maximum number of attempts. Please try again later',
  
  // Network errors
  'network_error': 'Network connection failed. Please check your internet and try again',
  'server_error': 'Server is temporarily unavailable. Please try again in a few moments',
  'timeout': 'Request timed out. Please check your connection and try again',
  
  // OTP errors
  'otp_expired': 'Verification code has expired. Please request a new one',
  'invalid_otp': 'Invalid verification code. Please check and try again',
  'otp_max_attempts': 'Maximum OTP attempts exceeded. Please request a new code',
  
  // General errors
  'required_fields': 'Please fill in all required fields',
  'invalid_input': 'Please check your input and try again',
  'operation_failed': 'Operation failed. Please try again',
  'session_expired': 'Your session has expired. Please sign in again',
  
  // Business-specific errors
  'business_name_required': 'Business name is required for wholesaler accounts',
  'invalid_cnic': 'Please enter a valid CNIC number',
  'invalid_ntn': 'Please enter a valid NTN number',
  'invalid_postal_code': 'Please enter a valid postal code',
  'city_required': 'Please select your city',
  'address_required': 'Please provide your complete address',
};

// Parse Supabase error and return user-friendly message
export const parseAuthError = (error: any): AuthError => {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    
    // Check for login/credential errors first
    if (lowerError.includes('incorrect email/phone or password') || 
        lowerError.includes('invalid login') || 
        lowerError.includes('invalid credentials')) {
      return {
        code: 'invalid_credentials',
        message: AUTH_ERROR_MESSAGES['invalid_credentials'],
      };
    }
    
    // Check for account existence
    if (lowerError.includes('user not found') || lowerError.includes('no account')) {
      return {
        code: 'user_not_found',
        message: AUTH_ERROR_MESSAGES['user_not_found'],
      };
    }
    
    // Check for already registered errors
    if (lowerError.includes('already registered') || lowerError.includes('already exists')) {
      if (lowerError.includes('phone')) {
        return {
          code: 'phone_already_exists',
          message: AUTH_ERROR_MESSAGES['phone_already_exists'],
          field: 'phone'
        };
      }
      return {
        code: 'user_already_registered',
        message: AUTH_ERROR_MESSAGES['user_already_registered'],
      };
    }
    
    // Password-specific errors
    if (lowerError.includes('password')) {
      if (lowerError.includes('weak')) {
        return {
          code: 'weak_password',
          message: AUTH_ERROR_MESSAGES['weak_password'],
          field: 'password'
        };
      }
      if (lowerError.includes('short')) {
        return {
          code: 'password_too_short',
          message: AUTH_ERROR_MESSAGES['password_too_short'],
          field: 'password'
        };
      }
      if (lowerError.includes('incorrect') || lowerError.includes('invalid')) {
        return {
          code: 'invalid_password',
          message: AUTH_ERROR_MESSAGES['invalid_password'],
          field: 'password'
        };
      }
    }
    
    // Phone-specific errors
    if (lowerError.includes('phone') && (lowerError.includes('invalid') || lowerError.includes('format'))) {
      return {
        code: 'invalid_phone',
        message: AUTH_ERROR_MESSAGES['invalid_phone'],
        field: 'phone'
      };
    }
    
    // Email-specific errors (but not when combined with phone)
    if (lowerError.includes('email') && !lowerError.includes('phone') && 
        (lowerError.includes('invalid') || lowerError.includes('format'))) {
      return {
        code: 'invalid_email',
        message: AUTH_ERROR_MESSAGES['invalid_email'],
        field: 'email'
      };
    }
    
    // Rate limiting
    if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
      return {
        code: 'rate_limit_exceeded',
        message: AUTH_ERROR_MESSAGES['rate_limit_exceeded'],
      };
    }
    
    // Network errors
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        code: 'network_error',
        message: AUTH_ERROR_MESSAGES['network_error'],
      };
    }
    
    return {
      code: 'GENERAL_ERROR',
      message: error,
    };
  }

  // Handle Supabase error objects
  const errorMessage = error.message || error.error_description || error.msg || '';
  const errorCode = error.code || error.error || (error.__isAuthError ? 'auth_error' : '');
  const lowerMessage = errorMessage.toLowerCase();
  
  // Check for invalid credentials (most common)
  if (errorCode === 'invalid_grant' || 
      errorCode === 'invalid_credentials' ||
      lowerMessage.includes('invalid login credentials') ||
      lowerMessage.includes('incorrect email/phone or password')) {
    return {
      code: 'invalid_credentials',
      message: AUTH_ERROR_MESSAGES['invalid_credentials'],
    };
  }
  
  // User not found
  if (lowerMessage.includes('user not found') || lowerMessage.includes('no account')) {
    return {
      code: 'user_not_found',
      message: AUTH_ERROR_MESSAGES['user_not_found'],
    };
  }
  
  // Already registered
  if (errorCode === 'user_already_exists' || lowerMessage.includes('already registered')) {
    if (lowerMessage.includes('phone')) {
      return {
        code: 'phone_already_exists',
        message: AUTH_ERROR_MESSAGES['phone_already_exists'],
        field: 'phone'
      };
    }
    return {
      code: 'user_already_registered',
      message: AUTH_ERROR_MESSAGES['user_already_registered'],
    };
  }
  
  // Email not confirmed
  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('confirm your email')) {
    return {
      code: 'email_not_confirmed',
      message: AUTH_ERROR_MESSAGES['email_not_confirmed'],
    };
  }
  
  // Rate limiting
  if (errorCode === '429' || lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return {
      code: 'rate_limit_exceeded',
      message: AUTH_ERROR_MESSAGES['rate_limit_exceeded'],
    };
  }
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return {
      code: 'network_error',
      message: AUTH_ERROR_MESSAGES['network_error'],
    };
  }
  
  // Account status errors
  if (lowerMessage.includes('suspended')) {
    return {
      code: 'account_suspended',
      message: AUTH_ERROR_MESSAGES['account_suspended'],
    };
  }
  
  if (lowerMessage.includes('pending')) {
    return {
      code: 'pending_approval',
      message: AUTH_ERROR_MESSAGES['pending_approval'],
    };
  }
  
  // Field-specific errors (only as last resort to avoid misinterpretation)
  if (!lowerMessage.includes('email/phone') && !lowerMessage.includes('credentials')) {
    if (lowerMessage.includes('email') && (lowerMessage.includes('invalid') || lowerMessage.includes('format'))) {
      return {
        code: 'invalid_email',
        message: AUTH_ERROR_MESSAGES['invalid_email'],
        field: 'email'
      };
    }
    
    if (lowerMessage.includes('password') && (lowerMessage.includes('invalid') || lowerMessage.includes('incorrect'))) {
      return {
        code: 'invalid_password',
        message: AUTH_ERROR_MESSAGES['invalid_password'],
        field: 'password'
      };
    }
    
    if (lowerMessage.includes('phone') && (lowerMessage.includes('invalid') || lowerMessage.includes('format'))) {
      return {
        code: 'invalid_phone',
        message: AUTH_ERROR_MESSAGES['invalid_phone'],
        field: 'phone'
      };
    }
  }
  
  // Return the original error message if no specific mapping found
  return {
    code: errorCode || 'UNKNOWN_ERROR',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    originalError: error
  };
};

// Show authentication error as toast
export const showAuthError = (error: any, context?: string): void => {
  const authError = parseAuthError(error);
  
  // Log for debugging
  console.error(`Auth error in ${context || 'unknown'}:`, {
    parsedError: authError,
    originalError: error
  });
  
  // Show user-friendly toast
  toast({
    title: "Authentication Error",
    description: authError.message,
    variant: "destructive",
  });
};

// Validate password strength and return specific error
export const validatePasswordStrength = (password: string): AuthError | null => {
  if (!password || password.length === 0) {
    return {
      code: 'password_required',
      message: 'Password is required',
      field: 'password'
    };
  }
  
  if (password.length < 6) {
    return {
      code: 'password_too_short',
      message: AUTH_ERROR_MESSAGES['password_too_short'],
      field: 'password'
    };
  }
  
  if (!/\d/.test(password)) {
    return {
      code: 'password_no_number',
      message: AUTH_ERROR_MESSAGES['password_no_number'],
      field: 'password'
    };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return {
      code: 'password_no_letter',
      message: AUTH_ERROR_MESSAGES['password_no_letter'],
      field: 'password'
    };
  }
  
  return null;
};

// Validate email format
export const validateEmail = (email: string): AuthError | null => {
  if (!email || email.length === 0) {
    return {
      code: 'email_required',
      message: 'Email address is required',
      field: 'email'
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      code: 'invalid_email',
      message: AUTH_ERROR_MESSAGES['invalid_email'],
      field: 'email'
    };
  }
  
  return null;
};

// Validate Pakistani phone number - wrapper that returns AuthError for consistency
export const validatePakistaniPhoneForError = (phone: string): AuthError | null => {
  if (!phone || phone.length === 0) {
    return {
      code: 'phone_required',
      message: 'Phone number is required',
      field: 'phone'
    };
  }

  // Use the phone-utils version for actual validation
  const isValid = validatePakistaniPhone(phone);
  if (!isValid) {
    return {
      code: 'invalid_phone_format',
      message: AUTH_ERROR_MESSAGES['invalid_phone_format'],
      field: 'phone'
    };
  }

  return null;
};

// Validate form fields and return all errors
export const validateAuthForm = (data: {
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}): AuthError[] => {
  const errors: AuthError[] = [];
  
  // Validate email if provided
  if (data.email !== undefined) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.push(emailError);
  }
  
  // Validate phone if provided
  if (data.phone !== undefined) {
    const phoneError = validatePakistaniPhone(data.phone);
    if (phoneError) errors.push(phoneError);
  }
  
  // Validate password if provided
  if (data.password !== undefined) {
    const passwordError = validatePasswordStrength(data.password);
    if (passwordError) errors.push(passwordError);
  }
  
  // Check password confirmation if provided
  if (data.confirmPassword !== undefined && data.password) {
    if (data.password !== data.confirmPassword) {
      errors.push({
        code: 'passwords_dont_match',
        message: AUTH_ERROR_MESSAGES['passwords_dont_match'],
        field: 'confirmPassword'
      });
    }
  }
  
  return errors;
};