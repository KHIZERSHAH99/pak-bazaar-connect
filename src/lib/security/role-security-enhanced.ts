import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

interface RoleChangeRequest {
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  reason?: string;
  businessJustification?: string;
}

interface RoleSecurityContext {
  ipAddress?: string;
  userAgent: string;
  timestamp: number;
  sessionDuration: number;
}

export class RoleSecurityManager {
  private readonly ADMIN_EMAIL_WHITELIST = ['khizerfight@gmail.com'];
  private readonly ROLE_CHANGE_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_ROLE_CHANGES_PER_DAY = 2;

  async validateRoleChange(request: RoleChangeRequest): Promise<{
    isAllowed: boolean;
    errors: string[];
    requiresApproval: boolean;
  }> {
    const errors: string[] = [];
    let requiresApproval = false;

    // Check if user is trying to become admin
    if (request.requestedRole === 'admin') {
      if (!this.ADMIN_EMAIL_WHITELIST.includes(await this.getUserEmail(request.userId))) {
        errors.push('Admin role is restricted to authorized personnel only');
        await this.logSuspiciousRoleAttempt(request);
        return { isAllowed: false, errors, requiresApproval: false };
      }
    }

    // Check role change frequency
    const recentChanges = await this.getRecentRoleChanges(request.userId);
    if (recentChanges >= this.MAX_ROLE_CHANGES_PER_DAY) {
      errors.push('Too many role changes attempted today. Please try again tomorrow.');
    }

    // Check cooldown period
    const lastChange = await this.getLastRoleChange(request.userId);
    if (lastChange && (Date.now() - lastChange.timestamp < this.ROLE_CHANGE_COOLDOWN)) {
      const remainingHours = Math.ceil((this.ROLE_CHANGE_COOLDOWN - (Date.now() - lastChange.timestamp)) / (60 * 60 * 1000));
      errors.push(`Role change is on cooldown. Try again in ${remainingHours} hours.`);
    }

    // Validate business logic for role changes
    const businessValidation = this.validateBusinessRoleLogic(request.currentRole, request.requestedRole);
    if (!businessValidation.isValid) {
      errors.push(...businessValidation.errors);
      requiresApproval = businessValidation.requiresApproval;
    }

    // Check account standing
    const accountStatus = await this.checkAccountStanding(request.userId);
    if (!accountStatus.isGoodStanding) {
      errors.push('Role changes not allowed due to account restrictions');
    }

    return {
      isAllowed: errors.length === 0,
      errors,
      requiresApproval
    };
  }

  private validateBusinessRoleLogic(currentRole: UserRole, requestedRole: UserRole): {
    isValid: boolean;
    errors: string[];
    requiresApproval: boolean;
  } {
    const errors: string[] = [];
    let requiresApproval = false;

    // Define allowed role transitions
    const allowedTransitions: Record<UserRole, UserRole[]> = {
      'pending': ['seller', 'wholesaler'],
      'seller': ['wholesaler'],
      'wholesaler': ['seller'],
      'admin': ['seller', 'wholesaler'] // Admin can switch to any role
    };

    if (!allowedTransitions[currentRole]?.includes(requestedRole)) {
      errors.push(`Role change from ${currentRole} to ${requestedRole} is not allowed`);
    }

    // Wholesaler to seller might need approval if they have active business
    if (currentRole === 'wholesaler' && requestedRole === 'seller') {
      requiresApproval = true; // Check for active shops/products
    }

    return { isValid: errors.length === 0, errors, requiresApproval };
  }

  async checkAccountStanding(userId: string): Promise<{
    isGoodStanding: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if account is suspended
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_suspended, suspension_reason, verification_status')
        .eq('id', userId)
        .single();

      if (profile?.is_suspended) {
        issues.push(`Account suspended: ${profile.suspension_reason || 'Unspecified reason'}`);
      }

      if (profile?.verification_status === 'rejected') {
        issues.push('Account verification was rejected');
      }

      // Check for recent security violations
      const { data: violations } = await supabase
        .from('audit_logs')
        .select('event_type, created_at')
        .eq('user_id', userId)
        .in('event_type', ['suspicious_activity_detected', 'security_violation'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (violations && violations.length > 0) {
        issues.push('Recent security violations detected');
      }


    } catch (error) {
      console.error('Error checking account standing:', error);
      issues.push('Unable to verify account standing');
    }

    return {
      isGoodStanding: issues.length === 0,
      issues
    };
  }

  private async getRecentRoleChanges(userId: string): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', 'role_changed')
        .gte('created_at', oneDayAgo);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error getting recent role changes:', error);
      return 0;
    }
  }

  private async getLastRoleChange(userId: string): Promise<{ timestamp: number } | null> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_type', 'role_changed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      
      return { timestamp: new Date(data.created_at).getTime() };
    } catch (error) {
      console.error('Error getting last role change:', error);
      return null;
    }
  }

  private async getUserEmail(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.email || '';
    } catch (error) {
      console.error('Error getting user email:', error);
      return '';
    }
  }

  private async logSuspiciousRoleAttempt(request: RoleChangeRequest): Promise<void> {
    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: request.userId,
        p_event_type: 'unauthorized_admin_attempt',
        p_table_name: 'profiles',
        p_new_values: JSON.stringify({
          requested_role: request.requestedRole,
          current_role: request.currentRole,
          timestamp: new Date().toISOString(),
          reason: request.reason
        })
      });
    } catch (error) {
      console.error('Failed to log suspicious role attempt:', error);
    }
  }

  async validateAdminOperation(userId: string, operation: string): Promise<{
    isAuthorized: boolean;
    reason?: string;
  }> {
    try {
      // First check if user is actually admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, role, is_suspended')
        .eq('id', userId)
        .single();

      if (!profile) {
        return { isAuthorized: false, reason: 'User profile not found' };
      }

      if (profile.role !== 'admin') {
        return { isAuthorized: false, reason: 'Admin role required' };
      }

      if (profile.is_suspended) {
        return { isAuthorized: false, reason: 'Admin account is suspended' };
      }

      // Check if email is in whitelist
      if (!this.ADMIN_EMAIL_WHITELIST.includes(profile.email)) {
        await this.logSuspiciousRoleAttempt({
          userId,
          currentRole: 'admin',
          requestedRole: 'admin',
          reason: `Unauthorized admin operation: ${operation}`
        });
        
        return { isAuthorized: false, reason: 'Email not authorized for admin operations' };
      }

      // Log successful admin operation
      await supabase.rpc('log_audit_event', {
        p_user_id: userId,
        p_event_type: 'admin_operation_authorized',
        p_new_values: JSON.stringify({
          operation,
          email: profile.email,
          timestamp: new Date().toISOString()
        })
      });

      return { isAuthorized: true };

    } catch (error) {
      console.error('Error validating admin operation:', error);
      return { isAuthorized: false, reason: 'Validation error occurred' };
    }
  }

  // Multi-factor authentication requirement for sensitive operations
  async requireMFAForOperation(userId: string, operation: string): Promise<boolean> {
    const sensitiveOperations = [
      'role_change_to_admin',
      'user_suspension',
      'commission_adjustment',
      'bulk_data_export'
    ];

    return sensitiveOperations.includes(operation);
  }
}

// Export singleton instance
export const roleSecurityManager = new RoleSecurityManager();
export default roleSecurityManager;