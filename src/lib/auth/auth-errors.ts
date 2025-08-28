import { toast } from '@/hooks/use-toast';

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
    
    // Check for specific error patterns
    if (lowerError.includes('email') && lowerError.includes('invalid')) {
      return {
        code: 'invalid_email',
        message: AUTH_ERROR_MESSAGES['invalid_email'],
        field: 'email'
      };
    }
    
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
    }
    
    if (lowerError.includes('phone')) {
      return {
        code: 'invalid_phone',
        message: AUTH_ERROR_MESSAGES['invalid_phone'],
        field: 'phone'
      };
    }
    
    return {
      code: 'GENERAL_ERROR',
      message: error,
    };
  }

  // Handle Supabase error objects
  const errorMessage = error.message || error.error_description || error.msg || '';
  const errorCode = error.code || error.error || '';
  
  // Check for specific Supabase error codes
  if (errorCode === 'invalid_grant' || errorMessage.includes('Invalid login credentials')) {
    return {
      code: 'invalid_credentials',
      message: AUTH_ERROR_MESSAGES['invalid_credentials'],
    };
  }
  
  if (errorCode === 'user_already_exists' || errorMessage.includes('already registered')) {
    return {
      code: 'user_already_registered',
      message: AUTH_ERROR_MESSAGES['user_already_registered'],
    };
  }
  
  if (errorMessage.includes('Email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message: AUTH_ERROR_MESSAGES['email_not_confirmed'],
    };
  }
  
  if (errorMessage.includes('rate limit') || errorCode === '429') {
    return {
      code: 'rate_limit_exceeded',
      message: AUTH_ERROR_MESSAGES['rate_limit_exceeded'],
    };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      code: 'network_error',
      message: AUTH_ERROR_MESSAGES['network_error'],
    };
  }
  
  if (errorMessage.includes('suspended')) {
    return {
      code: 'account_suspended',
      message: AUTH_ERROR_MESSAGES['account_suspended'],
    };
  }
  
  if (errorMessage.includes('pending')) {
    return {
      code: 'pending_approval',
      message: AUTH_ERROR_MESSAGES['pending_approval'],
    };
  }
  
  // Check for field-specific errors
  if (errorMessage.toLowerCase().includes('email')) {
    return {
      code: 'invalid_email',
      message: AUTH_ERROR_MESSAGES['invalid_email'],
      field: 'email'
    };
  }
  
  if (errorMessage.toLowerCase().includes('password')) {
    return {
      code: 'invalid_password',
      message: AUTH_ERROR_MESSAGES['invalid_password'],
      field: 'password'
    };
  }
  
  if (errorMessage.toLowerCase().includes('phone')) {
    return {
      code: 'invalid_phone',
      message: AUTH_ERROR_MESSAGES['invalid_phone'],
      field: 'phone'
    };
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

// Validate Pakistani phone number
export const validatePakistaniPhone = (phone: string): AuthError | null => {
  if (!phone || phone.length === 0) {
    return {
      code: 'phone_required',
      message: 'Phone number is required',
      field: 'phone'
    };
  }
  
  // Remove any spaces or dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with 03 and has 11 digits total
  if (!/^03\d{9}$/.test(cleanPhone)) {
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