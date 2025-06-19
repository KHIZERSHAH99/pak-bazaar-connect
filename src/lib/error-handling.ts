
import { toast } from '@/hooks/use-toast';
import { logSecurityViolation } from '@/lib/security/audit-enhanced';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ValidationError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

export class AuthorizationError extends Error {
  code: string;
  
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'AuthorizationError';
    this.code = 'UNAUTHORIZED';
  }
}

export class BusinessLogicError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR', details?: any) {
    super(message);
    this.name = 'BusinessLogicError';
    this.code = code;
    this.details = details;
  }
}

// Enhanced error handler with audit logging
export const handleError = async (error: any, context?: string) => {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  let userMessage = 'An unexpected error occurred. Please try again.';
  let shouldLog = true;

  if (error instanceof ValidationError) {
    userMessage = error.message;
    shouldLog = false; // Don't log validation errors as security violations
  } else if (error instanceof AuthorizationError) {
    userMessage = 'You are not authorized to perform this action.';
    
    // Log security violation
    await logSecurityViolation('unauthorized_access', {
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } else if (error instanceof BusinessLogicError) {
    userMessage = error.message;
  } else if (error?.message?.includes('JWT')) {
    userMessage = 'Your session has expired. Please log in again.';
    
    // Log potential security issue
    await logSecurityViolation('jwt_error', {
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } else if (error?.message?.includes('RLS')) {
    userMessage = 'Access denied. Please check your permissions.';
    
    // Log RLS violation
    await logSecurityViolation('rls_violation', {
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Show user-friendly toast
  toast({
    title: "Error",
    description: userMessage,
    variant: "destructive",
  });

  // Return structured error for programmatic handling
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: userMessage,
    originalError: error,
    timestamp: new Date()
  };
};

// File validation utilities
export const validateImageFile = (file: File): void => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 100 * 1024; // 100KB

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      'INVALID_FILE_TYPE'
    );
  }

  if (file.size > maxSize) {
    throw new ValidationError(
      'File size too large. Please upload an image smaller than 100KB.',
      'FILE_TOO_LARGE'
    );
  }
};

// Input validation utilities
export const validatePhoneNumber = (phone: string): void => {
  const phoneRegex = /^03\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError(
      'Invalid phone number. Please use format: 03XXXXXXXXX',
      'INVALID_PHONE'
    );
  }
};

export const validateAmount = (amount: number): void => {
  if (amount <= 0) {
    throw new ValidationError(
      'Amount must be greater than zero.',
      'INVALID_AMOUNT'
    );
  }

  if (amount > 10000000) { // 10 million PKR limit
    throw new ValidationError(
      'Amount exceeds maximum limit of Rs. 10,000,000.',
      'AMOUNT_TOO_LARGE'
    );
  }
};

// Rate limiting check
export const checkRateLimit = (action: string, userId: string): boolean => {
  const key = `rate_limit_${action}_${userId}`;
  const now = Date.now();
  const limit = 10; // 10 actions per minute
  const window = 60 * 1000; // 1 minute

  const stored = localStorage.getItem(key);
  const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + window };

  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + window;
  } else {
    data.count++;
  }

  localStorage.setItem(key, JSON.stringify(data));

  if (data.count > limit) {
    throw new ValidationError(
      'Too many requests. Please wait a moment before trying again.',
      'RATE_LIMIT_EXCEEDED'
    );
  }

  return true;
};
