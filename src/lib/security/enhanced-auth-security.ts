import { supabase } from '@/integrations/supabase/client';
import { enhancedRateLimiter, ENHANCED_RATE_LIMITS } from './enhanced-rate-limiting';

interface AuthAttempt {
  timestamp: number;
  success: boolean;
  identifier: string;
}

interface SecurityContext {
  userAgent: string;
  clientId: string;
  ipFingerprint: string;
}

class AuthSecurityManager {
  private failedAttempts = new Map<string, AuthAttempt[]>();
  private blockedAccounts = new Map<string, number>();
  private suspiciousIPs = new Set<string>();

  // Account lockout configuration
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SUSPICIOUS_THRESHOLD = 10;

  getSecurityContext(): SecurityContext {
    return {
      userAgent: navigator.userAgent,
      clientId: this.generateClientFingerprint(),
      ipFingerprint: this.generateIPFingerprint()
    };
  }

  private generateClientFingerprint(): string {
    const userAgent = navigator.userAgent;
    const hash = btoa(userAgent).slice(0, 16);
    return `client_${hash}`;
  }

  private generateIPFingerprint(): string {
    // Create a fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
      return btoa(canvas.toDataURL()).slice(0, 16);
    }
    return 'unknown';
  }

  async validatePasswordSecurity(password: string): Promise<{
    isValid: boolean;
    errors: string[];
    isBreached: boolean;
  }> {
    const errors: string[] = [];
    let score = 0;

    // Minimum length requirement
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Common patterns to avoid
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /pakistan/i,
      /karachi/i,
      /lahore/i
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns. Please choose a more unique password');
      score = Math.max(0, score - 2);
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot have the same character repeated 3 or more times');
      score = Math.max(0, score - 1);
    }

    const isValid = errors.length === 0 && score >= 4;

    return {
      isValid,
      errors,
      isBreached: false // Simplified for now
    };
  }

  async checkAccountLockout(identifier: string): Promise<{
    isLocked: boolean;
    remainingTime: number;
  }> {
    const lockoutTime = this.blockedAccounts.get(identifier);
    if (!lockoutTime) {
      return { isLocked: false, remainingTime: 0 };
    }

    const now = Date.now();
    const remainingTime = lockoutTime - now;

    if (remainingTime <= 0) {
      this.blockedAccounts.delete(identifier);
      this.failedAttempts.delete(identifier);
      return { isLocked: false, remainingTime: 0 };
    }

    return { isLocked: true, remainingTime };
  }

  async recordAuthAttempt(identifier: string, success: boolean): Promise<void> {
    const now = Date.now();
    const context = this.getSecurityContext();

    // Clean old attempts (older than 1 hour)
    const attempts = this.failedAttempts.get(identifier) || [];
    const recentAttempts = attempts.filter(a => now - a.timestamp < 60 * 60 * 1000);

    if (success) {
      // Clear failed attempts on successful login
      this.failedAttempts.delete(identifier);
      this.blockedAccounts.delete(identifier);
      
      await this.logSecurityEvent('successful_auth', {
        identifier,
        context,
        timestamp: now
      });
    } else {
      // Record failed attempt
      recentAttempts.push({
        timestamp: now,
        success: false,
        identifier
      });
      
      this.failedAttempts.set(identifier, recentAttempts);

      // Check if account should be locked
      if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
        this.blockedAccounts.set(identifier, now + this.LOCKOUT_DURATION);
        
        await this.logSecurityEvent('account_locked', {
          identifier,
          attemptCount: recentAttempts.length,
          lockoutDuration: this.LOCKOUT_DURATION,
          context
        });
      }

      await this.logSecurityEvent('failed_auth_attempt', {
        identifier,
        attemptCount: recentAttempts.length,
        context,
        timestamp: now
      });
    }
  }

  async checkRateLimit(action: string, identifier?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const limits = ENHANCED_RATE_LIMITS[action.toUpperCase() as keyof typeof ENHANCED_RATE_LIMITS] || ENHANCED_RATE_LIMITS.API_GENERAL;
    const rateLimitId = identifier || enhancedRateLimiter.getClientFingerprint();
    
    const result = await enhancedRateLimiter.checkRateLimit(rateLimitId, limits, action.toLowerCase());
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime
    };
  }

  async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let isSuspicious = false;

    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      // Check for rapid role switching
      const { data: roleChanges } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'role_changed')
        .gte('created_at', oneHourAgo);

      if (roleChanges && roleChanges.length > 2) {
        reasons.push('Rapid role switching detected');
        isSuspicious = true;
      }

      // Check for excessive order creation
      const { data: orderActivity } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'order_created')
        .gte('created_at', oneHourAgo);

      if (orderActivity && orderActivity.length > 20) {
        reasons.push('Excessive order creation detected');
        isSuspicious = true;
      }

      if (isSuspicious) {
        await this.logSecurityEvent('suspicious_activity_detected', {
          userId,
          reasons,
          context: this.getSecurityContext()
        });
      }

    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
    }

    return { isSuspicious, reasons };
  }

  private async logSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      // Direct insert into audit_logs instead of using non-existent RPC function
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: details.userId || null,
          event_type: eventType,
          new_values: details,
          table_name: 'authentication'
        });
      
      if (error) {
        console.warn('Failed to log security event:', error);
      }
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  // Check for demo/weak credentials in production using pattern detection
  // No hardcoded credentials - uses pattern-based detection instead
  isDemoCredentials(identifier: string, password: string): boolean {
    const isDev = import.meta.env.DEV || 
                  window.location.hostname === 'localhost' ||
                  window.location.hostname.includes('preview');
    
    if (isDev) {
      return false; // Allow in development/preview
    }

    // Pattern-based detection for demo/test credentials (no hardcoded values)
    const identifierPatterns = [
      /^test/i,
      /^demo/i,
      /^admin@test/i,
      /^user\d*@/i,
      /@test\.com$/i,
      /@example\.com$/i,
      /^0300{6,}/  // Repeated zeros pattern
    ];

    const weakPasswordPatterns = [
      /^demo\d*$/i,
      /^test\d*$/i,
      /^admin\d*$/i,
      /^password\d*$/i,
      /^123456/,
      /^qwerty/i
    ];

    const isTestIdentifier = identifierPatterns.some(p => p.test(identifier));
    const isWeakPassword = weakPasswordPatterns.some(p => p.test(password));

    return isTestIdentifier && isWeakPassword;
  }

  async enforceSecureLogin(identifier: string, password: string): Promise<{
    allowed: boolean;
    message?: string;
    lockoutTime?: number;
  }> {
    // Check if using demo credentials in production
    if (this.isDemoCredentials(identifier, password)) {
      await this.logSecurityEvent('demo_credentials_blocked', {
        identifier,
        environment: process.env.NODE_ENV
      });
      
      return {
        allowed: false,
        message: 'Demo credentials are not allowed in production. Please contact support.'
      };
    }

    // Check account lockout
    const lockoutStatus = await this.checkAccountLockout(identifier);
    if (lockoutStatus.isLocked) {
      return {
        allowed: false,
        message: `Account temporarily locked. Try again in ${Math.ceil(lockoutStatus.remainingTime / 60000)} minutes.`,
        lockoutTime: lockoutStatus.remainingTime
      };
    }

    // Check rate limits
    const rateLimit = await this.checkRateLimit('LOGIN', identifier);
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        message: 'Too many login attempts. Please try again later.'
      };
    }

    return { allowed: true };
  }
}

// Export singleton instance
export const authSecurityManager = new AuthSecurityManager();
export default authSecurityManager;