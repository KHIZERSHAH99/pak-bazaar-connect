/**
 * Security Audit Scheduler
 * Manages automated security scans and audit scheduling
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecurityAuditSchedule {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  name: string;
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
  checks: string[];
}

export class SecurityAuditScheduler {
  private schedules: SecurityAuditSchedule[] = [
    {
      id: 'daily-auth-audit',
      type: 'daily',
      name: 'Authentication Security Audit',
      nextRun: SecurityAuditScheduler.getNextRunDate('daily'),
      enabled: true,
      checks: ['failed_logins', 'suspicious_patterns', 'rate_limits']
    },
    {
      id: 'weekly-data-audit',
      type: 'weekly',
      name: 'Data Access Audit',
      nextRun: SecurityAuditScheduler.getNextRunDate('weekly'),
      enabled: true,
      checks: ['profile_access', 'commission_access', 'order_modifications']
    },
    {
      id: 'monthly-full-audit',
      type: 'monthly',
      name: 'Comprehensive Security Audit',
      nextRun: SecurityAuditScheduler.getNextRunDate('monthly'),
      enabled: true,
      checks: ['all_security_events', 'role_changes', 'admin_actions', 'vulnerability_scan']
    }
  ];

  private static getNextRunDate(type: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    const next = new Date(now);
    
    switch (type) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(3, 0, 0, 0); // Run at 3 AM
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay())); // Next Sunday
        next.setHours(2, 0, 0, 0); // Run at 2 AM
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1, 1); // First day of next month
        next.setHours(1, 0, 0, 0); // Run at 1 AM
        break;
    }
    
    return next;
  }

  /**
   * Run scheduled security audits
   */
  async runScheduledAudits(): Promise<void> {
    const now = new Date();
    
    for (const schedule of this.schedules) {
      if (!schedule.enabled) continue;
      
      if (now >= schedule.nextRun) {
        await this.runAudit(schedule);
        
        // Update next run date
        schedule.lastRun = now;
        schedule.nextRun = SecurityAuditScheduler.getNextRunDate(schedule.type);
        
        // Log audit execution
        await this.logAuditExecution(schedule);
      }
    }
  }

  /**
   * Run a specific audit
   */
  private async runAudit(schedule: SecurityAuditSchedule): Promise<void> {
    console.log(`Running ${schedule.name}...`);
    
    for (const check of schedule.checks) {
      switch (check) {
        case 'failed_logins':
          await this.checkFailedLogins();
          break;
        case 'suspicious_patterns':
          await this.checkSuspiciousPatterns();
          break;
        case 'rate_limits':
          await this.checkRateLimitViolations();
          break;
        case 'profile_access':
          await this.checkProfileAccessPatterns();
          break;
        case 'commission_access':
          await this.checkCommissionAccess();
          break;
        case 'order_modifications':
          await this.checkOrderModifications();
          break;
        case 'all_security_events':
          await this.reviewAllSecurityEvents();
          break;
        case 'role_changes':
          await this.checkRoleChanges();
          break;
        case 'admin_actions':
          await this.checkAdminActions();
          break;
        case 'vulnerability_scan':
          await this.runVulnerabilityScan();
          break;
      }
    }
  }

  /**
   * Check for failed login attempts
   */
  private async checkFailedLogins(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'auth_failure')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking failed logins:', error);
      return;
    }

    // Analyze failed login patterns
    const ipAddresses = new Map<string, number>();
    const users = new Map<string, number>();

    data?.forEach(log => {
      const ip = String(log.ip_address || '');
      const userId = String(log.user_id || '');
      
      if (ip) {
        ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
      }
      if (userId) {
        users.set(userId, (users.get(userId) || 0) + 1);
      }
    });

    // Alert on suspicious patterns
    for (const [ip, count] of ipAddresses) {
      if (count > 10) {
        await this.createSecurityAlert('suspicious_ip', {
          ip_address: String(ip),
          failed_attempts: count,
          time_window: '24 hours'
        });
      }
    }
  }

  /**
   * Check for suspicious access patterns
   */
  private async checkSuspiciousPatterns(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('event_type', ['admin_profile_view', 'sensitive_profile_data_changed'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking suspicious patterns:', error);
      return;
    }

    // Analyze access patterns
    const userPatterns = new Map<string, number>();
    
    data?.forEach(log => {
      const userId = log.user_id;
      if (userId) {
        userPatterns.set(userId, (userPatterns.get(userId) || 0) + 1);
      }
    });

    // Alert on excessive access
    for (const [userId, count] of userPatterns) {
      if (count > 50) {
        await this.createSecurityAlert('excessive_data_access', {
          user_id: userId,
          access_count: count,
          time_window: '7 days'
        });
      }
    }
  }

  /**
   * Check rate limit violations
   */
  private async checkRateLimitViolations(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'rate_limit_exceeded')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking rate limits:', error);
      return;
    }

    if (data && data.length > 100) {
      await this.createSecurityAlert('excessive_rate_limiting', {
        violation_count: data.length,
        time_window: '24 hours'
      });
    }
  }

  /**
   * Check profile access patterns
   */
  private async checkProfileAccessPatterns(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('event_type', ['profile_query', 'profile_view', 'admin_profile_view'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking profile access:', error);
      return;
    }

    // Analyze patterns
    const accessByHour = new Map<number, number>();
    
    data?.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      accessByHour.set(hour, (accessByHour.get(hour) || 0) + 1);
    });

    // Check for unusual access times
    for (const [hour, count] of accessByHour) {
      if ((hour < 6 || hour > 22) && count > 50) {
        await this.createSecurityAlert('unusual_access_time', {
          hour,
          access_count: count,
          message: 'High profile access during off-hours'
        });
      }
    }
  }

  /**
   * Check commission access patterns
   */
  private async checkCommissionAccess(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'commission_data_accessed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking commission access:', error);
      return;
    }

    // Analyze unauthorized access attempts
    const unauthorizedAttempts = data?.filter(log => {
      const newValues = log.new_values as any;
      return newValues?.error === 'Access denied';
    });

    if (unauthorizedAttempts && unauthorizedAttempts.length > 10) {
      await this.createSecurityAlert('commission_access_violations', {
        attempt_count: unauthorizedAttempts.length,
        time_window: '30 days'
      });
    }
  }

  /**
   * Check order modifications
   */
  private async checkOrderModifications(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'order_status_changed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking order modifications:', error);
      return;
    }

    // Check for rapid status changes
    const orderChanges = new Map<string, number>();
    
    data?.forEach(log => {
      const orderId = log.record_id;
      if (orderId) {
        orderChanges.set(orderId, (orderChanges.get(orderId) || 0) + 1);
      }
    });

    for (const [orderId, count] of orderChanges) {
      if (count > 5) {
        await this.createSecurityAlert('excessive_order_changes', {
          order_id: orderId,
          change_count: count,
          time_window: '7 days'
        });
      }
    }
  }

  /**
   * Review all security events
   */
  private async reviewAllSecurityEvents(): Promise<void> {
    const criticalEvents = [
      'security_breach_attempt',
      'unauthorized_access',
      'suspicious_access_pattern',
      'potential_security_breach',
      'data_breach_attempt'
    ];

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('event_type', criticalEvents)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error reviewing security events:', error);
      return;
    }

    if (data && data.length > 0) {
      await this.createSecurityAlert('critical_security_events', {
        event_count: data.length,
        events: data.map(e => ({
          type: e.event_type,
          date: e.created_at,
          user: e.user_id
        }))
      });
    }
  }

  /**
   * Check role changes
   */
  private async checkRoleChanges(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('event_type', ['role_changed', 'role_switch', 'admin_role_granted'])
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking role changes:', error);
      return;
    }

    // Check for suspicious role elevations
    const adminGrants = data?.filter(log => {
      const newValues = log.new_values as any;
      return newValues?.new_role === 'admin' || log.event_type === 'admin_role_granted';
    });

    if (adminGrants && adminGrants.length > 0) {
      await this.createSecurityAlert('admin_role_grants', {
        grant_count: adminGrants.length,
        grants: adminGrants.map(g => ({
          user: g.user_id,
          date: g.created_at
        }))
      });
    }
  }

  /**
   * Check admin actions
   */
  private async checkAdminActions(): Promise<void> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .like('event_type', 'admin_%')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking admin actions:', error);
      return;
    }

    // Group by admin user
    const adminActions = new Map<string, number>();
    
    data?.forEach(log => {
      const userId = log.user_id;
      if (userId) {
        adminActions.set(userId, (adminActions.get(userId) || 0) + 1);
      }
    });

    // Alert on excessive admin actions
    for (const [userId, count] of adminActions) {
      if (count > 100) {
        await this.createSecurityAlert('excessive_admin_actions', {
          admin_id: userId,
          action_count: count,
          time_window: '7 days'
        });
      }
    }
  }

  /**
   * Run vulnerability scan
   */
  private async runVulnerabilityScan(): Promise<void> {
    // This would typically integrate with a vulnerability scanning service
    // For now, we'll check for common security issues
    
    const checks = [
      this.checkWeakPasswords(),
      this.checkUnverifiedAccounts(),
      this.checkSuspendedAccounts(),
      this.checkStaleData()
    ];

    await Promise.all(checks);
  }

  /**
   * Check for weak passwords (would need integration with password policy)
   */
  private async checkWeakPasswords(): Promise<void> {
    // This would check password policy compliance
    console.log('Checking password policy compliance...');
  }

  /**
   * Check for unverified accounts
   */
  private async checkUnverifiedAccounts(): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('verification_status', 'pending')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking unverified accounts:', error);
      return;
    }

    if (data && data.length > 50) {
      await this.createSecurityAlert('excessive_unverified_accounts', {
        count: data.length,
        message: 'Large number of unverified accounts detected'
      });
    }
  }

  /**
   * Check for suspended accounts
   */
  private async checkSuspendedAccounts(): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, suspension_reason')
      .eq('is_suspended', true);

    if (error) {
      console.error('Error checking suspended accounts:', error);
      return;
    }

    if (data && data.length > 0) {
      const reasons = new Map<string, number>();
      
      data.forEach(profile => {
        const reason = profile.suspension_reason || 'unknown';
        reasons.set(reason, (reasons.get(reason) || 0) + 1);
      });

      await this.createSecurityAlert('suspended_accounts_review', {
        total_suspended: data.length,
        reasons: Array.from(reasons.entries()).map(([reason, count]) => ({
          reason,
          count
        }))
      });
    }
  }

  /**
   * Check for stale data that should be cleaned
   */
  private async checkStaleData(): Promise<void> {
    // Check for old payment screenshots
    const { data: oldScreenshots } = await supabase
      .from('orders')
      .select('id')
      .not('payment_screenshot', 'is', null)
      .eq('status', 'completed')
      .lte('delivered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (oldScreenshots && oldScreenshots.length > 0) {
      await this.createSecurityAlert('stale_payment_data', {
        count: oldScreenshots.length,
        message: 'Old payment screenshots should be cleaned'
      });
    }
  }

  /**
   * Create a security alert
   */
  private async createSecurityAlert(type: string, details: any): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        event_type: `security_alert_${type}`,
        table_name: 'security_audit',
        new_values: {
          alert_type: type,
          details,
          created_at: new Date().toISOString()
        }
      }]);

    if (error) {
      console.error('Error creating security alert:', error);
    } else {
      console.log(`Security alert created: ${type}`, details);
    }
  }

  /**
   * Log audit execution
   */
  private async logAuditExecution(schedule: SecurityAuditSchedule): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        event_type: 'security_audit_executed',
        table_name: 'security_audit',
        new_values: {
          schedule_id: schedule.id,
          schedule_name: schedule.name,
          schedule_type: schedule.type,
          checks_performed: schedule.checks,
          last_run: schedule.lastRun?.toISOString(),
          next_run: schedule.nextRun.toISOString()
        }
      }]);

    if (error) {
      console.error('Error logging audit execution:', error);
    }
  }

  /**
   * Get upcoming audits
   */
  getUpcomingAudits(): SecurityAuditSchedule[] {
    return this.schedules
      .filter(s => s.enabled)
      .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
  }

  /**
   * Enable/disable a specific audit schedule
   */
  setScheduleEnabled(scheduleId: string, enabled: boolean): void {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.enabled = enabled;
    }
  }
}

// Export singleton instance
export const auditScheduler = new SecurityAuditScheduler();