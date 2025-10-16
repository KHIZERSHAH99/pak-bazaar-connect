import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from './unified-rate-limiting';

export interface SecurityContext {
  userId?: string;
  isAuthenticated: boolean;
  role?: string;
  hasPermission: (permission: string) => boolean;
}

/**
 * Get security context for current user
 */
export async function getSecurityContext(): Promise<SecurityContext> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      isAuthenticated: false,
      hasPermission: () => false,
    };
  }

  // Get role from user_roles table
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = roleData?.role || 'pending';

  return {
    userId: user.id,
    isAuthenticated: true,
    role,
    hasPermission: (permission: string) => {
      // Admin has all permissions
      if (role === 'admin') return true;
      
      // Define role-based permissions
      const permissions: Record<string, string[]> = {
        wholesaler: ['manage_shops', 'manage_products', 'view_orders', 'manage_ads'],
        seller: ['place_orders', 'view_products', 'manage_profile'],
        pending: ['view_products'],
      };
      
      return permissions[role]?.includes(permission) || false;
    },
  };
}

/**
 * Validate user has required role
 */
export async function requireRole(requiredRole: string | string[]): Promise<boolean> {
  const context = await getSecurityContext();
  
  if (!context.isAuthenticated) {
    throw new Error('Authentication required');
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  if (!roles.includes(context.role || '')) {
    throw new Error('Insufficient permissions');
  }

  return true;
}

/**
 * Validate user has required permission
 */
export async function requirePermission(permission: string): Promise<boolean> {
  const context = await getSecurityContext();
  
  if (!context.isAuthenticated) {
    throw new Error('Authentication required');
  }

  if (!context.hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return true;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 10000); // Max length
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('csrf_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) return false;

    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      return false;
    }

    // Mark token as used
    await supabase
      .from('csrf_tokens')
      .update({ used: true })
      .eq('id', data.id);

    return true;
  } catch {
    return false;
  }
}

/**
 * Secure fetch wrapper with rate limiting and CSRF
 */
export async function secureFetch(
  endpoint: string,
  options: RequestInit = {},
  requireCSRF = false
): Promise<Response> {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(endpoint);
  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded');
  }

  // Add CSRF token if required
  if (requireCSRF && options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    const { data: tokenData } = await supabase.rpc('generate_csrf_token');
    if (tokenData) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': tokenData,
      };
    }
  }

  return fetch(endpoint, options);
}

/**
 * Check if user account is suspended
 */
export async function checkAccountSuspension(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('is_suspended')
    .eq('id', user.id)
    .single();

  return data?.is_suspended || false;
}
