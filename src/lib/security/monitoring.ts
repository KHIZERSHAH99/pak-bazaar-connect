
import { auditLogger } from './audit-logger';

export interface SecurityEvent {
  type: 'login_failure' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventCounts = new Map<string, { count: number; lastReset: number }>();
  private suspiciousPatterns = new Map<string, number>();

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  async reportSecurityEvent(event: SecurityEvent): Promise<void> {
    await auditLogger.log({
      action: `security_${event.type}`,
      resource: 'security',
      details: event.details,
      severity: event.severity
    });

    // Track suspicious patterns
    this.trackSuspiciousActivity(event);

    // Auto-respond to critical events
    if (event.severity === 'critical') {
      await this.handleCriticalEvent(event);
    }
  }

  private trackSuspiciousActivity(event: SecurityEvent): void {
    const key = `${event.type}_${event.details.userId || 'anonymous'}`;
    const current = this.suspiciousPatterns.get(key) || 0;
    this.suspiciousPatterns.set(key, current + 1);

    // Check for patterns that indicate potential attacks
    if (current >= 5) {
      this.reportSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        details: {
          pattern: event.type,
          occurrences: current + 1,
          timeWindow: '15min'
        }
      });
    }
  }

  private async handleCriticalEvent(event: SecurityEvent): Promise<void> {
    // Log to console for immediate visibility
    console.error('🚨 CRITICAL SECURITY EVENT:', event);

    // In a real system, you might:
    // - Send alerts to administrators
    // - Temporarily block suspicious IPs
    // - Trigger additional security measures
  }

  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = identifier;
    const current = this.eventCounts.get(key);

    if (!current || now - current.lastReset > windowMs) {
      this.eventCounts.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (current.count >= maxRequests) {
      this.reportSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: { identifier, maxRequests, windowMs }
      });
      return false;
    }

    current.count++;
    return true;
  }

  async monitorLoginAttempt(email: string, success: boolean, details?: Record<string, any>): Promise<void> {
    if (!success) {
      await this.reportSecurityEvent({
        type: 'login_failure',
        severity: 'medium',
        details: { email, ...details }
      });
    }
  }

  async monitorUnauthorizedAccess(resource: string, details?: Record<string, any>): Promise<void> {
    await this.reportSecurityEvent({
      type: 'unauthorized_access',
      severity: 'high',
      details: { resource, ...details }
    });
  }

  // Clean up old tracking data periodically
  cleanup(): void {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    for (const [key, data] of this.eventCounts.entries()) {
      if (now - data.lastReset > fiveMinutes) {
        this.eventCounts.delete(key);
      }
    }

    // Reset suspicious patterns every hour
    if (now % (60 * 60 * 1000) < 1000) {
      this.suspiciousPatterns.clear();
    }
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

// Auto-cleanup every 5 minutes
setInterval(() => securityMonitor.cleanup(), 5 * 60 * 1000);
