// Enhanced guest session management for secure guest orders
// Improved security with hash-based session tokens and fingerprinting
const GUEST_SESSION_KEY = 'pbc_guest_session';
const SESSION_EXPIRY_HOURS = 24;
const MAX_ORDERS_PER_SESSION = 5;

export interface GuestSession {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  orderCount: number;
  fingerprint: string; // Browser fingerprint for validation
  lastActivity: Date;
}

// Generate a browser fingerprint for additional validation
const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let fingerprint = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('GuestSessionFingerprint', 2, 2);
    fingerprint = canvas.toDataURL().slice(-32);
  }
  
  // Combine with other browser characteristics
  const characteristics = [
    navigator.userAgent.slice(0, 50),
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    fingerprint
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < characteristics.length; i++) {
    const char = characteristics.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

export class GuestSessionManager {
  private static instance: GuestSessionManager;
  private currentFingerprint: string;
  
  private constructor() {
    this.currentFingerprint = generateFingerprint();
  }
  
  static getInstance(): GuestSessionManager {
    if (!GuestSessionManager.instance) {
      GuestSessionManager.instance = new GuestSessionManager();
    }
    return GuestSessionManager.instance;
  }
  
  // Get or create a guest session with fingerprint validation
  getSession(): GuestSession {
    try {
      const stored = localStorage.getItem(GUEST_SESSION_KEY);
      
      if (stored) {
        const session = JSON.parse(stored) as GuestSession;
        const expiresAt = new Date(session.expiresAt);
        
        // Check if session is still valid and fingerprint matches
        if (expiresAt > new Date() && session.fingerprint === this.currentFingerprint) {
          // Update last activity
          session.lastActivity = new Date();
          localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
          return session;
        }
      }
    } catch (error) {
      console.warn('Failed to parse guest session:', error);
    }
    
    // Create new session if none exists or validation failed
    return this.createSession();
  }
  
  // Create a new guest session with fingerprint
  private createSession(): GuestSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const session: GuestSession = {
      id: crypto.randomUUID(),
      createdAt: now,
      expiresAt: expiresAt,
      orderCount: 0,
      fingerprint: this.currentFingerprint,
      lastActivity: now
    };
    
    try {
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to store guest session:', error);
    }
    
    return session;
  }
  
  // Increment order count for rate limiting
  incrementOrderCount(): void {
    try {
      const session = this.getSession();
      session.orderCount++;
      session.lastActivity = new Date();
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to update guest session:', error);
    }
  }
  
  // Check if guest can place more orders
  canPlaceOrder(): boolean {
    const session = this.getSession();
    return session.orderCount < MAX_ORDERS_PER_SESSION;
  }
  
  // Get remaining orders allowed
  getRemainingOrders(): number {
    const session = this.getSession();
    return Math.max(0, MAX_ORDERS_PER_SESSION - session.orderCount);
  }
  
  // Clear guest session
  clearSession(): void {
    try {
      localStorage.removeItem(GUEST_SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear guest session:', error);
    }
  }
  
  // Get session ID for order creation (with fingerprint validation)
  getSessionId(): string {
    return this.getSession().id;
  }
  
  // Validate a session ID belongs to current browser
  validateSessionOwnership(sessionId: string): boolean {
    const session = this.getSession();
    return session.id === sessionId && session.fingerprint === this.currentFingerprint;
  }
}

export const guestSessionManager = GuestSessionManager.getInstance();