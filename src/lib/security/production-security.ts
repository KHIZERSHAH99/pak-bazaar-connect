import { supabase } from '@/integrations/supabase/client';

interface ProductionSecurityConfig {
  blockDemoCredentials: boolean;
  enforceStrongPasswords: boolean;
  enableSuspiciousActivityDetection: boolean;
  logSecurityEvents: boolean;
}

class ProductionSecurityManager {
  private config: ProductionSecurityConfig = {
    blockDemoCredentials: import.meta.env.PROD,
    enforceStrongPasswords: true,
    enableSuspiciousActivityDetection: true,
    logSecurityEvents: true
  };

  // Demo credentials that should be blocked in production
  private readonly DEMO_CREDENTIALS = [
    { identifier: '03001234567', password: 'demo123' },
    { identifier: '03004567890', password: 'demo123' },
    { identifier: 'admin@test.com', password: 'admin123' },
    { identifier: 'wholesaler1@test.com', password: 'wholesale123' },
    { identifier: 'seller1@test.com', password: 'seller123' },
    { identifier: 'test@example.com', password: 'password' },
    { identifier: 'demo@demo.com', password: 'demo123' }
  ];

  // Test data patterns to block
  private readonly TEST_DATA_PATTERNS = [
    'test', 'demo', 'sample', 'placeholder', 'example',
    'lorem', 'ipsum', 'dummy', 'fake', 'mock'
  ];

  /**
   * Check if credentials are demo/test credentials that should be blocked
   */
  isDemoCredentials(identifier: string, password: string): boolean {
    if (!this.config.blockDemoCredentials) {
      return false;
    }

    return this.DEMO_CREDENTIALS.some(cred =>
      (cred.identifier === identifier.toLowerCase()) && 
      (cred.password === password)
    );
  }

  /**
   * Validate that business data doesn't contain test patterns
   */
  validateBusinessData(data: {
    businessName?: string;
    contactName?: string;
    address?: string;
    email?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check business name
    if (data.businessName) {
      const businessLower = data.businessName.toLowerCase();
      if (this.TEST_DATA_PATTERNS.some(pattern => businessLower.includes(pattern))) {
        errors.push('Business name appears to be test data. Please enter a real business name.');
      }
    }

    // Check contact name
    if (data.contactName) {
      const contactLower = data.contactName.toLowerCase();
      if (this.TEST_DATA_PATTERNS.some(pattern => contactLower.includes(pattern))) {
        errors.push('Contact name appears to be test data. Please enter a real contact name.');
      }
    }

    // Check address
    if (data.address) {
      const addressLower = data.address.toLowerCase();
      if (this.TEST_DATA_PATTERNS.some(pattern => addressLower.includes(pattern))) {
        errors.push('Address appears to be test data. Please enter a real business address.');
      }
    }

    // Check email
    if (data.email) {
      const emailLower = data.email.toLowerCase();
      if (this.TEST_DATA_PATTERNS.some(pattern => emailLower.includes(pattern))) {
        errors.push('Email appears to be test data. Please enter a real email address.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Enhanced password validation for production
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.enforceStrongPasswords) {
      return { isValid: password.length >= 6, errors: password.length >= 6 ? [] : ['Password too short'] };
    }

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Character requirements
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Common weak password patterns
    const weakPatterns = [
      'password', '123456', 'admin', 'test', 'demo',
      'qwerty', 'abc123', 'password123', 'admin123'
    ];

    if (weakPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('Password cannot contain common weak patterns');
    }

    // Sequential characters
    if (/123|abc|qwe|zxc/i.test(password)) {
      errors.push('Password cannot contain sequential characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Log security events for monitoring
   */
  async logSecurityEvent(
    eventType: 'demo_credentials_blocked' | 'test_data_detected' | 'weak_password_attempt' | 'suspicious_signup',
    details: Record<string, any>
  ): Promise<void> {
    if (!this.config.logSecurityEvents) {
      return;
    }

    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: null,
        p_event_type: eventType,
        p_table_name: 'security_monitoring',
        p_new_values: JSON.stringify({
          ...details,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Comprehensive security check for authentication
   */
  async performSecurityCheck(
    identifier: string,
    password: string,
    additionalData?: Record<string, any>
  ): Promise<{
    allowed: boolean;
    blocked: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let blocked = false;

    // Check for demo credentials
    if (this.isDemoCredentials(identifier, password)) {
      issues.push('Demo credentials detected');
      blocked = true;
      await this.logSecurityEvent('demo_credentials_blocked', {
        identifier,
        environment: process.env.NODE_ENV
      });
    }

    // Check password strength
    const passwordCheck = this.validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      issues.push(...passwordCheck.errors);
      recommendations.push('Use a stronger password with mixed case letters, numbers, and special characters');
      
      if (this.config.enforceStrongPasswords) {
        blocked = true;
        await this.logSecurityEvent('weak_password_attempt', {
          identifier,
          errors: passwordCheck.errors
        });
      }
    }

    // Check additional business data if provided
    if (additionalData) {
      const businessCheck = this.validateBusinessData(additionalData);
      if (!businessCheck.isValid) {
        issues.push(...businessCheck.errors);
        recommendations.push('Please provide genuine business information, not test data');
        blocked = true;
        await this.logSecurityEvent('test_data_detected', {
          identifier,
          errors: businessCheck.errors,
          data: additionalData
        });
      }
    }

    return {
      allowed: !blocked,
      blocked,
      issues,
      recommendations
    };
  }

  /**
   * Get security configuration
   */
  getConfig(): ProductionSecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration (for testing purposes)
   */
  updateConfig(newConfig: Partial<ProductionSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const productionSecurity = new ProductionSecurityManager();
export default productionSecurity;