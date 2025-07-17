
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Enhanced error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Enhanced error handler with comprehensive logging
export const handleError = async (error: any, context?: string) => {
  console.error(`Error in ${context || 'unknown'}:`, error);
  
  // Log to audit system
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_event_type: 'error_occurred',
      p_table_name: null,
      p_record_id: null,
      p_old_values: null,
      p_new_values: JSON.stringify({
        error: error.message,
        context,
        stack: error.stack?.substring(0, 1000)
      })
    });
  } catch (auditError) {
    console.error('Failed to log error to audit:', auditError);
  }

  let userMessage = 'An unexpected error occurred. Please try again.';
  
  if (error instanceof ValidationError) {
    userMessage = error.message;
  } else if (error instanceof AuthenticationError) {
    userMessage = 'Please log in to continue.';
  } else if (error instanceof AuthorizationError) {
    userMessage = 'You don\'t have permission to perform this action.';
  } else if (error instanceof NetworkError) {
    userMessage = 'Connection failed. Please check your internet and try again.';
  } else if (error?.message?.includes('JWT')) {
    userMessage = 'Your session has expired. Please log in again.';
  } else if (error?.message?.includes('RLS')) {
    userMessage = 'Access denied. Please check your permissions.';
  }

  toast({
    title: "Error",
    description: userMessage,
    variant: "destructive",
  });

  return { error, userMessage };
};

// Input validation with enhanced security
export const validateAndSanitizeInput = (input: string, maxLength = 1000) => {
  if (!input || typeof input !== 'string') {
    throw new ValidationError('Invalid input provided');
  }

  // Check for potential XSS
  if (/<script|javascript:|on\w+=/i.test(input)) {
    throw new ValidationError('Invalid characters detected');
  }

  // Check for SQL injection patterns
  if (/(\bDROP\b|\bDELETE\b|\bTRUNCATE\b|\bUNION\b|\bSELECT\b.*\bFROM\b)/i.test(input)) {
    throw new ValidationError('Invalid content detected');
  }

  return input.trim().substring(0, maxLength);
};

// File validation with enhanced security
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxDimensions?: { width: number; height: number };
} = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxDimensions = { width: 2048, height: 2048 }
  } = options;

  if (file.size > maxSize) {
    throw new ValidationError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  return true;
};

// Rate limiting check
export const checkRateLimit = (action: string, maxAttempts = 10, windowMs = 60000) => {
  const key = `rate_limit_${action}`;
  const now = Date.now();
  
  const stored = localStorage.getItem(key);
  const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };

  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
  } else {
    data.count++;
  }

  localStorage.setItem(key, JSON.stringify(data));

  if (data.count > maxAttempts) {
    throw new ValidationError('Too many requests. Please wait before trying again.');
  }

  return true;
};
