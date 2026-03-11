
import { supabase } from '@/integrations/supabase/client';

interface RateLimitEntry {
  key: string;
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  async checkRateLimit(identifier: string, maxRequests: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = identifier;
    
    let entry = this.storage.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = {
        key,
        count: 0,
        resetTime: now + windowMs
      };
    }

    entry.count++;
    this.storage.set(key, entry);

    const allowed = entry.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - entry.count);

    // Log rate limit violations
    if (!allowed) {
      console.warn(`Rate limit exceeded for ${identifier}: ${entry.count}/${maxRequests}`);
      await this.logSecurityEvent('rate_limit_exceeded', {
        identifier,
        count: entry.count,
        limit: maxRequests
      });
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  }

  private async logSecurityEvent(event: string, details: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(`Security Event: ${event}`, {
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        details
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Rate limiting presets
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 } // 3 attempts per hour
};

// Helper function to get client identifier (IP + User Agent hash)
export const getClientIdentifier = (): string => {
  const userAgent = navigator.userAgent;
  const hash = btoa(userAgent).slice(0, 16);
  return `client_${hash}`;
};
