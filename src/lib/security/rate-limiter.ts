import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

export class RateLimiter {
  private static requestCounts = new Map<string, { count: number; resetTime: Date }>();

  /**
   * Check if request should be rate limited (client-side pre-check)
   */
  static isRateLimited(endpoint: string, maxRequests: number = 100): boolean {
    const key = endpoint;
    const now = new Date();
    const existing = this.requestCounts.get(key);

    if (!existing || existing.resetTime < now) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour window
      });
      return false;
    }

    if (existing.count >= maxRequests) {
      return true;
    }

    existing.count++;
    return false;
  }

  /**
   * Check rate limit server-side
   */
  static async checkServerRateLimit(
    endpoint: string,
    maxRequests: number = 100,
    windowMinutes: number = 60
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For development, use a mock IP address
      const ipAddress = '127.0.0.1';
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user?.id || null,
        p_ip_address: ipAddress,
        p_endpoint: endpoint,
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Fail closed - assume rate limited on error
      }

      return data !== true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Fail closed
    }
  }

  /**
   * Reset client-side rate limit tracking for an endpoint
   */
  static reset(endpoint?: string): void {
    if (endpoint) {
      this.requestCounts.delete(endpoint);
    } else {
      this.requestCounts.clear();
    }
  }

  /**
   * Get remaining requests for an endpoint
   */
  static getRemainingRequests(endpoint: string, maxRequests: number = 100): number {
    const existing = this.requestCounts.get(endpoint);
    
    if (!existing || existing.resetTime < new Date()) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - existing.count);
  }

  /**
   * Get reset time for an endpoint
   */
  static getResetTime(endpoint: string): Date | null {
    const existing = this.requestCounts.get(endpoint);
    return existing?.resetTime || null;
  }
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { endpoint: '/auth/login', maxRequests: 5, windowMinutes: 15 },
  signup: { endpoint: '/auth/signup', maxRequests: 3, windowMinutes: 60 },
  otp: { endpoint: '/auth/otp', maxRequests: 3, windowMinutes: 60 },
  order: { endpoint: '/orders', maxRequests: 20, windowMinutes: 60 },
  product: { endpoint: '/products', maxRequests: 100, windowMinutes: 60 },
  chat: { endpoint: '/chat', maxRequests: 30, windowMinutes: 60 },
  upload: { endpoint: '/upload', maxRequests: 10, windowMinutes: 60 },
  payment: { endpoint: '/payment', maxRequests: 10, windowMinutes: 60 },
  profile_update: { endpoint: '/profile', maxRequests: 10, windowMinutes: 60 },
  role_switch: { endpoint: '/role-switch', maxRequests: 3, windowMinutes: 1440 } // 3 per day
};