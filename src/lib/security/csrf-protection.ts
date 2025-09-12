import { supabase } from '@/integrations/supabase/client';

export class CSRFProtection {
  private static token: string | null = null;
  private static tokenExpiry: Date | null = null;

  /**
   * Generate a new CSRF token
   */
  static async generateToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('generate_csrf_token');
      
      if (error) {
        console.error('Failed to generate CSRF token:', error);
        return null;
      }
      
      this.token = data;
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes
      
      return data;
    } catch (error) {
      console.error('CSRF token generation error:', error);
      return null;
    }
  }

  /**
   * Get current token or generate new one if expired
   */
  static async getToken(): Promise<string | null> {
    if (!this.token || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      return await this.generateToken();
    }
    return this.token;
  }

  /**
   * Validate a CSRF token server-side
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('validate_csrf_token', { p_token: token });
      
      if (error) {
        console.error('CSRF validation error:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  /**
   * Add CSRF token to request headers
   */
  static async addToHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
    const token = await this.getToken();
    
    if (token) {
      return {
        ...headers,
        'X-CSRF-Token': token
      };
    }
    
    return headers;
  }

  /**
   * Clear stored token
   */
  static clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }
}

// Auto-refresh token on auth state change
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    CSRFProtection.clearToken();
  } else if (event === 'SIGNED_IN') {
    CSRFProtection.generateToken();
  }
});