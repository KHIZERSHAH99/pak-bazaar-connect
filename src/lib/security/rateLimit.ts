
import { supabase } from '@/integrations/supabase/client';

interface RateLimitEntry {
  key: string;
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

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
    
    // Check if this is a demo account - exempt from rate limiting
    if (this.isDemoAccount(identifier)) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowMs
      };
    }
    
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

    // Enhanced logging for rate limit violations
    if (!allowed) {
      console.warn(`🚨 Rate limit exceeded for ${identifier}: ${entry.count}/${maxRequests}`);
      await this.logSecurityEvent('rate_limit_exceeded', {
        identifier,
        count: entry.count,
        limit: maxRequests,
        windowMs,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Check for suspicious activity patterns
      if (entry.count > maxRequests * 2) {
        await this.logSecurityEvent('suspicious_rate_limit_activity', {
          identifier,
          count: entry.count,
          limit: maxRequests,
          severity: 'high'
        });
      }
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  }

  // New method for checking progressive penalties
  async checkProgressiveRateLimit(identifier: string, action: string): Promise<{ allowed: boolean; remaining: number; resetTime: number; penaltyMultiplier: number }> {
    const violationKey = `violations_${identifier}_${action}`;
    const violations = parseInt(localStorage.getItem(violationKey) || '0');
    
    // Progressive penalty: each violation increases the penalty
    const penaltyMultiplier = Math.min(Math.pow(2, violations), 8); // Max 8x penalty
    const baseLimit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.API_GENERAL;
    const adjustedLimit = Math.max(1, Math.floor(baseLimit.maxRequests / penaltyMultiplier));
    const adjustedWindow = baseLimit.windowMs * penaltyMultiplier;

    const result = await this.checkRateLimit(identifier, adjustedLimit, adjustedWindow);

    // Track violations
    if (!result.allowed) {
      localStorage.setItem(violationKey, (violations + 1).toString());
      localStorage.setItem(`${violationKey}_expiry`, (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24h expiry
    }

    return {
      ...result,
      penaltyMultiplier
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

  // Check if identifier contains demo account patterns
  private isDemoAccount(identifier: string): boolean {
    const demoPhones = ['03001234567', '03004567890', '03007891234'];
    return demoPhones.some(phone => identifier.includes(phone));
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Enhanced rate limiting presets with security considerations
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 minutes (increased from 5)
  SIGNUP: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 attempts per hour (increased from 3)
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  ORDER_CREATE: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 orders per hour
  PRODUCT_CREATE: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 products per hour
  MESSAGE_SEND: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 messages per hour
  PROFILE_UPDATE: { maxRequests: 5, windowMs: 60 * 60 * 1000 } // 5 profile updates per hour
};

// Helper function to get client identifier (IP + User Agent hash)
export const getClientIdentifier = (): string => {
  const userAgent = navigator.userAgent;
  const hash = btoa(userAgent).slice(0, 16);
  return `client_${hash}`;
};
