import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Enhanced security monitoring and validation
export class SecurityManager {
  private static instance: SecurityManager;
  
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Log security events
  async logSecurityEvent(
    eventType: string,
    details: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    try {
      const user = await getCurrentUser();
      
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        event_type: `security_${eventType}`,
        new_values: { ...details, severity },
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get client IP (best effort)
  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  // Validate user session and permissions
  async validateUserSession(): Promise<{ isValid: boolean; user: any; permissions: string[] }> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return { isValid: false, user: null, permissions: [] };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, is_suspended, suspended_until')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        await this.logSecurityEvent('invalid_profile_access', { user_id: user.id }, 'high');
        return { isValid: false, user: null, permissions: [] };
      }

      // Check if user is suspended
      if (profile.is_suspended) {
        const now = new Date();
        const suspendedUntil = profile.suspended_until ? new Date(profile.suspended_until) : null;
        
        if (!suspendedUntil || now < suspendedUntil) {
          await this.logSecurityEvent('suspended_user_access', { 
            user_id: user.id, 
            suspended_until: profile.suspended_until 
          }, 'high');
          return { isValid: false, user: null, permissions: [] };
        }
      }

      const permissions = this.getRolePermissions(profile.role);
      
      return { isValid: true, user: { ...user, profile }, permissions };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false, user: null, permissions: [] };
    }
  }

  // Get permissions for a role
  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'manage_users', 'manage_shops', 'manage_products', 'manage_orders',
        'view_analytics', 'manage_commissions', 'manage_system'
      ],
      wholesaler: [
        'manage_own_shops', 'manage_own_products',
        'view_own_orders', 'update_order_status', 'view_own_analytics',
        'manage_payment_methods'
      ],
      seller: [
        'view_shops', 'view_products', 'create_orders', 'view_own_orders',
        'message_wholesalers'
      ],
      pending: []
    };

    return rolePermissions[role] || [];
  }

  // Check if user has specific permission
  async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const targetUserId = userId || (await getCurrentUser())?.id;
      if (!targetUserId) return false;

      const session = await this.validateUserSession();
      if (!session.isValid) return false;

      return session.permissions.includes(permission) || 
             session.user.profile.role === 'admin';
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Validate resource ownership
  async validateResourceOwnership(
    resourceType: 'shop' | 'product' | 'order',
    resourceId: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const targetUserId = userId || (await getCurrentUser())?.id;
      if (!targetUserId) return false;

      const session = await this.validateUserSession();
      if (!session.isValid) return false;

      // Admin can access everything
      if (session.user.profile.role === 'admin') return true;

      switch (resourceType) {
        case 'shop':
          const { data: shop } = await supabase
            .from('shops')
            .select('owner_id')
            .eq('id', resourceId)
            .single();
          return shop?.owner_id === targetUserId;

        case 'product':
          const { data: product } = await supabase
            .from('products')
            .select('shops!fk_products_shop_id(owner_id)')
            .eq('id', resourceId)
            .single();
          return product?.shops?.owner_id === targetUserId;

        case 'order':
          const { data: order } = await supabase
            .from('orders')
            .select('buyer_id, shops!fk_orders_shop_id(owner_id)')
            .eq('id', resourceId)
            .single();
          return order?.buyer_id === targetUserId || order?.shops?.owner_id === targetUserId;

        default:
          return false;
      }
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      await this.logSecurityEvent('ownership_validation_error', {
        resourceType,
        resourceId,
        userId,
        error: error.message
      }, 'medium');
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(action: string, limit: number = 100, windowMinutes: number = 60): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_type', action)
        .gte('created_at', windowStart.toISOString());

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow if we can't check
      }

      const count = data?.length || 0;
      const isWithinLimit = count < limit;

      if (!isWithinLimit) {
        await this.logSecurityEvent('rate_limit_exceeded', {
          action,
          count,
          limit,
          windowMinutes
        }, 'medium');
      }

      return isWithinLimit;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow if error occurs
    }
  }

  // Input sanitization with security focus
  sanitizeInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data URLs
      .replace(/vbscript:/gi, '') // Remove vbscript
      .slice(0, maxLength);
  }

  // Validate business data with security checks
  validateBusinessData(data: any): { isValid: boolean; errors: string[]; sanitized: any } {
    const errors: string[] = [];
    const sanitized: any = {};

    // Sanitize all string inputs
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        sanitized[key] = this.sanitizeInput(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    });

    // Business name validation
    if (!sanitized.business_name || sanitized.business_name.length < 2) {
      errors.push('Business name must be at least 2 characters');
    }

    // Phone validation
    if (sanitized.phone_number && !/^(\+92|0)?3[0-9]{2}[0-9]{7}$/.test(sanitized.phone_number.replace(/[-\s]/g, ''))) {
      errors.push('Invalid Pakistani phone number');
    }

    // Prevent common injection patterns
    const dangerousPatterns = [
      /\b(union|select|insert|update|delete|drop|create|alter)\b/i,
      /<script/i,
      /javascript:/i,
      /on\w+=/i
    ];

    Object.values(sanitized).forEach(value => {
      if (typeof value === 'string') {
        dangerousPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            errors.push('Input contains potentially dangerous content');
          }
        });
      }
    });

    return { isValid: errors.length === 0, errors, sanitized };
  }

  // Monitor suspicious activities
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check for multiple failed attempts
      const { data: failedAttempts } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', userId)
        .ilike('event_type', '%failed%')
        .gte('created_at', oneDayAgo.toISOString());

      // Check for unusual activity patterns
      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('event_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });

      const failedCount = failedAttempts?.length || 0;
      const activityCount = recentActivity?.length || 0;

      // Detect suspicious patterns
      const isSuspicious = failedCount > 10 || activityCount > 200;

      if (isSuspicious) {
        await this.logSecurityEvent('suspicious_activity_detected', {
          failed_attempts: failedCount,
          total_activity: activityCount
        }, 'high');
      }

      return isSuspicious;
    } catch (error) {
      console.error('Suspicious activity detection error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();