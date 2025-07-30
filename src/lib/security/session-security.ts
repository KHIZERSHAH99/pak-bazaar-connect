import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, getClientIdentifier } from './rateLimit';

interface SessionSecurityConfig {
  sessionTimeout: number; // in milliseconds
  maxConcurrentSessions: number;
  checkInterval: number; // in milliseconds
}

class SessionSecurityManager {
  private config: SessionSecurityConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private sessionStartTime: number = Date.now();

  constructor(config: Partial<SessionSecurityConfig> = {}) {
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes default
      maxConcurrentSessions: 3,
      checkInterval: 60 * 1000, // 1 minute
      ...config
    };
  }

  startMonitoring() {
    this.updateActivity();
    this.checkInterval = setInterval(() => {
      this.checkSession();
    }, this.config.checkInterval);

    // Monitor user activity
    this.setupActivityListeners();
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.removeActivityListeners();
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  private setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true);
    });
  }

  private removeActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.updateActivity.bind(this), true);
    });
  }

  private async checkSession() {
    const now = Date.now();
    
    // Check for session timeout
    if (now - this.lastActivity > this.config.sessionTimeout) {
      await this.handleSessionTimeout();
      return;
    }

    // Check for suspicious patterns
    await this.checkSuspiciousActivity();
  }

  private async handleSessionTimeout() {
    try {
      console.log('🔒 Session timeout detected, logging out...');
      
      // Log security event
      await this.logSecurityEvent('session_timeout', {
        sessionDuration: Date.now() - this.sessionStartTime,
        lastActivity: this.lastActivity,
        timeout: this.config.sessionTimeout
      });

      // Sign out user
      await supabase.auth.signOut();
      
      // Redirect to login
      window.location.href = '/login?reason=session_timeout';
    } catch (error) {
      console.error('Error handling session timeout:', error);
    }
  }

  private async checkSuspiciousActivity() {
    const clientId = getClientIdentifier();
    
    // Check for rapid page changes (potential bot activity)
    const pageViews = parseInt(localStorage.getItem(`page_views_${clientId}`) || '0');
    const viewsResetTime = parseInt(localStorage.getItem(`page_views_reset_${clientId}`) || '0');
    
    if (Date.now() > viewsResetTime) {
      localStorage.setItem(`page_views_${clientId}`, '1');
      localStorage.setItem(`page_views_reset_${clientId}`, (Date.now() + 60000).toString()); // Reset every minute
    } else {
      const newViews = pageViews + 1;
      localStorage.setItem(`page_views_${clientId}`, newViews.toString());
      
      if (newViews > 30) { // More than 30 page views per minute
        await this.logSecurityEvent('suspicious_navigation_pattern', {
          pageViews: newViews,
          timeWindow: '1 minute',
          severity: 'medium'
        });
      }
    }
  }

  private async logSecurityEvent(eventType: string, details: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log(`🔍 Security Event: ${eventType}`, details);
      
      // You could also send this to a security monitoring service
      // or store it in a security_events table in your database
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Method to check for multiple active sessions
  async checkConcurrentSessions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store current session info
      const sessionInfo = {
        userId: user.id,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        clientId: getClientIdentifier()
      };

      // In a real implementation, you'd store this in a database
      // and check against other active sessions
      localStorage.setItem('current_session', JSON.stringify(sessionInfo));
      
    } catch (error) {
      console.error('Error checking concurrent sessions:', error);
    }
  }

  // Method to detect location/device changes
  async detectAnomalousLogin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentFingerprint = this.generateDeviceFingerprint();
      const lastFingerprint = localStorage.getItem(`device_fingerprint_${user.id}`);

      if (lastFingerprint && lastFingerprint !== currentFingerprint) {
        await this.logSecurityEvent('device_change_detected', {
          userId: user.id,
          lastFingerprint,
          currentFingerprint,
          severity: 'high'
        });
      }

      localStorage.setItem(`device_fingerprint_${user.id}`, currentFingerprint);
    } catch (error) {
      console.error('Error detecting anomalous login:', error);
    }
  }

  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint', 10, 10);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      canvas: canvas.toDataURL()
    };

    return btoa(JSON.stringify(fingerprint)).slice(0, 32);
  }
}

// Create singleton instance
export const sessionSecurity = new SessionSecurityManager();

// Auto-start monitoring when user is authenticated
export const initializeSessionSecurity = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      sessionSecurity.startMonitoring();
      sessionSecurity.checkConcurrentSessions();
      sessionSecurity.detectAnomalousLogin();
    } else if (event === 'SIGNED_OUT') {
      sessionSecurity.stopMonitoring();
    }
  });
};