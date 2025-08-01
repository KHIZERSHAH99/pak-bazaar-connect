import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength, checkPasswordBreached, logPasswordSecurityEvent } from './password-validation';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from './rateLimit';

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
      clientId: getClientIdentifier(),
      ipFingerprint: this.generateIPFingerprint()
    };
  }

  private generateIPFingerprint(): string {
    // Create a fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Security fingerprint', 2, 2);
    
    return btoa(canvas.toDataURL()).slice(0, 16);
  }

  async validatePasswordSecurity(password: string): Promise<{
    isValid: boolean;
    errors: string[];
    isBreached: boolean;
  }> {
    const strengthResult = validatePasswordStrength(password);
    const isBreached = await checkPasswordBreached(password);

    if (isBreached) {
      await logPasswordSecurityEvent('breached_password_attempted', {
        timestamp: new Date().toISOString()
      });
    } else if (!strengthResult.isValid) {
      await logPasswordSecurityEvent('weak_password_attempted', {
        score: strengthResult.score,
        errors: strengthResult.errors
      });
    } else {
      await logPasswordSecurityEvent('strong_password_created', {
        score: strengthResult.score
      });
    }

    return {
      isValid: strengthResult.isValid && !isBreached,
      errors: isBreached 
        ? ['This password has been found in data breaches. Please choose a different password.']
        : strengthResult.errors,
      isBreached
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
    const limits = RATE_LIMITS[action.toUpperCase() as keyof typeof RATE_LIMITS] || RATE_LIMITS.API_GENERAL;
    const rateLimitId = identifier || getClientIdentifier();
    
    return await rateLimiter.checkRateLimit(rateLimitId, limits.maxRequests, limits.windowMs);
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

      // Check for unusual file upload patterns
      const { data: uploadActivity } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'file_uploaded')
        .gte('created_at', oneHourAgo);

      if (uploadActivity && uploadActivity.length > 50) {
        reasons.push('Excessive file upload activity detected');
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
      await supabase.rpc('log_audit_event', {
        p_user_id: details.userId || (await supabase.auth.getUser()).data.user?.id,
        p_event_type: eventType,
        p_new_values: JSON.stringify(details)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Remove demo credentials in production
  isDemoCredentials(identifier: string, password: string): boolean {
    const demoCredentials = [
      { phone: '03001234567', pass: 'demo123' },
      { phone: '03004567890', pass: 'demo123' },
      { email: 'admin@test.com', pass: 'admin123' },
      { email: 'wholesaler1@test.com', pass: 'wholesale123' },
      { email: 'seller1@test.com', pass: 'seller123' }
    ];

    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      // Block demo credentials in production
      return demoCredentials.some(cred => 
        (cred.phone === identifier || cred.email === identifier) && cred.pass === password
      );
    }

    return false;
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