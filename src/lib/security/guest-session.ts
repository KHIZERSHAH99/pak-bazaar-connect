// Guest session management for secure guest orders
const GUEST_SESSION_KEY = 'pbc_guest_session';
const SESSION_EXPIRY_HOURS = 24;

export interface GuestSession {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  orderCount: number;
}

export class GuestSessionManager {
  private static instance: GuestSessionManager;
  
  private constructor() {}
  
  static getInstance(): GuestSessionManager {
    if (!GuestSessionManager.instance) {
      GuestSessionManager.instance = new GuestSessionManager();
    }
    return GuestSessionManager.instance;
  }
  
  // Get or create a guest session
  getSession(): GuestSession {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    
    if (stored) {
      const session = JSON.parse(stored) as GuestSession;
      const expiresAt = new Date(session.expiresAt);
      
      // Check if session is still valid
      if (expiresAt > new Date()) {
        return session;
      }
    }
    
    // Create new session
    return this.createSession();
  }
  
  // Create a new guest session
  private createSession(): GuestSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const session: GuestSession = {
      id: crypto.randomUUID(),
      createdAt: now,
      expiresAt: expiresAt,
      orderCount: 0
    };
    
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    return session;
  }
  
  // Increment order count for rate limiting
  incrementOrderCount(): void {
    const session = this.getSession();
    session.orderCount++;
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }
  
  // Check if guest can place more orders
  canPlaceOrder(): boolean {
    const session = this.getSession();
    return session.orderCount < 5; // Max 5 orders per session
  }
  
  // Clear guest session
  clearSession(): void {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
  
  // Get session ID for order creation
  getSessionId(): string {
    return this.getSession().id;
  }
}

export const guestSessionManager = GuestSessionManager.getInstance();