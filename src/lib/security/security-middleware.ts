import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, RATE_LIMITS } from './rateLimit';
import { sessionSecurity, initializeSessionSecurity } from './session-security';
import { validateFileUpload } from './file-security';
import { validateAndSanitizeInput } from './validation';

export interface SecurityMiddlewareConfig {
  enableRateLimit: boolean;
  enableSessionSecurity: boolean;
  enableInputValidation: boolean;
  enableFileValidation: boolean;
  logSecurityEvents: boolean;
}

class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;
  private initialized = false;

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = {
      enableRateLimit: true,
      enableSessionSecurity: true,
      enableInputValidation: true,
      enableFileValidation: true,
      logSecurityEvents: true,
      ...config
    };
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🔒 Initializing Security Middleware...');

    // Initialize session security monitoring
    if (this.config.enableSessionSecurity) {
      initializeSessionSecurity();
    }

    // Set up security headers (if in browser environment)
    if (typeof window !== 'undefined') {
      this.setupSecurityHeaders();
    }

    // Monitor for suspicious activity
    this.setupSecurityMonitoring();

    this.initialized = true;
    console.log('✅ Security Middleware initialized successfully');
  }

  private setupSecurityHeaders() {
    // Content Security Policy (basic implementation)
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com;";
    document.head.appendChild(meta);

    // Add security-related event listeners
    window.addEventListener('beforeunload', () => {
      // Clean up sensitive data before page unload
      this.cleanupSensitiveData();
    });

    // Prevent common attacks
    this.preventCommonAttacks();
  }

  private preventCommonAttacks() {
    // Prevent right-click context menu on production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        // Allow context menu in dev tools for debugging
        if (!e.target || !(e.target as Element).closest('.dev-tools-allowed')) {
          e.preventDefault();
        }
      });
    }

    // Prevent F12 key in production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
        }
      });
    }

    // Monitor for suspicious console activity
    let consoleWarningShown = false;
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (!consoleWarningShown && process.env.NODE_ENV === 'production') {
        console.warn('🚨 Security Warning: Console access detected. If you\'re not a developer, close this window immediately.');
        consoleWarningShown = true;
      }
      originalConsoleLog.apply(console, args);
    };
  }

  private setupSecurityMonitoring() {
    // Monitor for potential security events
    window.addEventListener('error', (event) => {
      if (this.config.logSecurityEvents) {
        this.logSecurityEvent('client_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    });

    // Monitor for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.config.logSecurityEvents) {
        this.logSecurityEvent('unhandled_rejection', {
          reason: event.reason?.toString(),
          type: 'promise_rejection'
        });
      }
    });
  }

  private cleanupSensitiveData() {
    // Clear any sensitive data from memory/storage before page unload
    try {
      // Clear form data that might contain sensitive information
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[type="password"], input[type="email"], input[type="tel"]');
        inputs.forEach((input: any) => {
          input.value = '';
        });
      });

      // Clear clipboard if it contains sensitive data
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('').catch(() => {
          // Ignore errors
        });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  // Public methods for use in components

  async validateInput(input: string, type: 'text' | 'business' | 'description' = 'text'): Promise<string> {
    if (!this.config.enableInputValidation) return input;
    
    try {
      return validateAndSanitizeInput(input, type);
    } catch (error) {
      console.error('Input validation failed:', error);
      throw error;
    }
  }

  async checkRateLimit(action: string, identifier?: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.config.enableRateLimit) return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };

    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.API_GENERAL;
    const key = identifier || `${action}_${this.getUserIdentifier()}`;
    
    return await rateLimiter.checkRateLimit(key, limit.maxRequests, limit.windowMs);
  }

  async validateFileUpload(file: File, options = {}) {
    if (!this.config.enableFileValidation) return { isValid: true, errors: [], warnings: [] };
    
    return await validateFileUpload(file, options);
  }

  private getUserIdentifier(): string {
    // Get a unique identifier for the current user/session
    try {
      const userAgent = navigator.userAgent;
      const timestamp = Math.floor(Date.now() / (1000 * 60 * 10)); // 10-minute windows
      return btoa(`${userAgent}_${timestamp}`).slice(0, 16);
    } catch {
      return 'anonymous';
    }
  }

  private async logSecurityEvent(eventType: string, details: any) {
    if (!this.config.logSecurityEvents) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const securityLog = {
        event_type: eventType,
        user_id: user?.id || null,
        details: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href
      };

      console.log('🔍 Security Event:', securityLog);

      // In a real implementation, you might want to send this to a security monitoring service
      // or store it in a dedicated security_logs table
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Emergency security functions
  async emergencyLockdown() {
    console.warn('🚨 Emergency security lockdown activated');
    
    try {
      // Sign out user
      await supabase.auth.signOut();
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to a safe page
      window.location.href = '/security-notice';
      
    } catch (error) {
      console.error('Emergency lockdown failed:', error);
      // Force page reload as fallback
      window.location.reload();
    }
  }

  async reportSecurityIncident(incident: { type: string; description: string; severity: 'low' | 'medium' | 'high' | 'critical' }) {
    await this.logSecurityEvent('security_incident_reported', incident);
    
    if (incident.severity === 'critical') {
      // For critical incidents, you might want to immediately notify administrators
      console.error('🚨 CRITICAL SECURITY INCIDENT:', incident);
    }
  }
}

// Create singleton instance
export const securityMiddleware = new SecurityMiddleware();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  securityMiddleware.initialize();
}