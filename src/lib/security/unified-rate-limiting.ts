import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { endpoint: '/auth/login', maxRequests: 5, windowMinutes: 15 },
  signup: { endpoint: '/auth/signup', maxRequests: 3, windowMinutes: 60 },
  order: { endpoint: '/orders', maxRequests: 20, windowMinutes: 60 },
  upload: { endpoint: '/upload', maxRequests: 10, windowMinutes: 60 },
  api: { endpoint: '/api', maxRequests: 100, windowMinutes: 1 },
};

/**
 * Check rate limit using server-side function
 */
export async function checkRateLimit(
  endpoint: string,
  config?: Partial<RateLimitConfig>
): Promise<{ allowed: boolean; remaining?: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const finalConfig = config || RATE_LIMITS[endpoint] || RATE_LIMITS.api;

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: user?.id || null,
      p_ip_address: null, // IP will be handled server-side
      p_endpoint: endpoint,
      p_max_requests: finalConfig.maxRequests,
      p_window_minutes: finalConfig.windowMinutes,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow the request but log the error
      await logSecurityEvent('rate_limit_check_failed', 'medium', { error: error.message });
      return { allowed: true };
    }

    if (!data) {
      await logSecurityEvent('rate_limit_exceeded', 'high', { endpoint });
      return { allowed: false };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Log security event
 */
async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details?: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_user_id: user?.id || null,
      p_ip_address: null,
      p_user_agent: navigator?.userAgent || null,
      p_severity: severity,
      p_details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit(endpoint: string, config?: Partial<RateLimitConfig>) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await checkRateLimit(endpoint, config);
      
      if (!result.allowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
