import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  progressiveDelay?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  isBlocked?: boolean;
}

class EnhancedRateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number; blocked?: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime && (!entry.blocked || now > entry.blocked)) {
        this.attempts.delete(key);
      }
    }
  }

  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
    action?: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `${identifier}:${action || 'default'}`;
    
    let entry = this.attempts.get(key);
    
    // Check if currently blocked
    if (entry?.blocked && now < entry.blocked) {
      await this.logSecurityEvent('rate_limit_blocked_attempt', {
        identifier,
        action,
        blockExpiresAt: new Date(entry.blocked).toISOString()
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.blocked - now,
        isBlocked: true
      };
    }
    
    // Reset if window expired or no entry exists
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: undefined
      };
    }

    entry.count++;
    this.attempts.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (!allowed) {
      // Apply progressive blocking
      let blockDuration = config.blockDurationMs || 15 * 60 * 1000; // Default 15 minutes
      
      if (config.progressiveDelay) {
        const violations = Math.floor(entry.count / config.maxRequests);
        blockDuration = blockDuration * Math.pow(2, violations - 1); // Exponential backoff
      }
      
      entry.blocked = now + blockDuration;
      this.attempts.set(key, entry);

      await this.logSecurityEvent('rate_limit_exceeded', {
        identifier,
        action,
        count: entry.count,
        limit: config.maxRequests,
        blockDuration,
        progressive: config.progressiveDelay
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: blockDuration,
        isBlocked: true
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: entry.resetTime
    };
  }

  private async logSecurityEvent(event: string, details: any) {
    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_event_type: event,
        p_new_values: JSON.stringify(details)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get client fingerprint for rate limiting
  getClientFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Rate limit fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
export const enhancedRateLimiter = new EnhancedRateLimiter();

// Enhanced rate limiting configurations
export const ENHANCED_RATE_LIMITS = {
  LOGIN: { 
    maxRequests: 5, 
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
    progressiveDelay: true 
  },
  SIGNUP: { 
    maxRequests: 3, 
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
    progressiveDelay: true 
  },
  PASSWORD_RESET: { 
    maxRequests: 3, 
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours block
    progressiveDelay: true 
  },
  OTP_REQUEST: { 
    maxRequests: 5, 
    windowMs: 30 * 60 * 1000, // 30 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
    progressiveDelay: true 
  },
  FILE_UPLOAD: { 
    maxRequests: 20, 
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  },
  API_GENERAL: { 
    maxRequests: 100, 
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000 // 1 minute block
  },
  ADMIN_OPERATIONS: { 
    maxRequests: 50, 
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  }
} as const;

// Helper functions for common rate limiting scenarios
export const checkLoginRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.LOGIN, 'login');

export const checkSignupRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.SIGNUP, 'signup');

export const checkPasswordResetRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.PASSWORD_RESET, 'password_reset');

export const checkOTPRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.OTP_REQUEST, 'otp_request');

export const checkFileUploadRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.FILE_UPLOAD, 'file_upload');

export const checkAdminOperationRateLimit = (identifier: string) => 
  enhancedRateLimiter.checkRateLimit(identifier, ENHANCED_RATE_LIMITS.ADMIN_OPERATIONS, 'admin_operation');