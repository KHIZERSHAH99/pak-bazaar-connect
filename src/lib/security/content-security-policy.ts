/**
 * Content Security Policy configuration
 * Helps prevent XSS attacks by controlling what resources can be loaded
 */

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'frame-src': [
    "'self'",
    "https://www.highperformanceformat.com",
    "https://pl27701721.revenuecpmgate.com",
    "https://*.highperformanceformat.com",
    "https://*.revenuecpmgate.com"
  ],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React in development
    "'unsafe-eval'", // Required for development tools
    "https://sxzxyuxtqqflahzncfre.supabase.co",
    "https://*.supabase.co",
    "https://www.highperformanceformat.com",
    "https://pl27701721.revenuecpmgate.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and inline styles
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https://sxzxyuxtqqflahzncfre.supabase.co",
    "https://*.supabase.co",
    "https://www.highperformanceformat.com",
    "https://pl27701721.revenuecpmgate.com",
    "https://*.highperformanceformat.com",
    "https://*.revenuecpmgate.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://sxzxyuxtqqflahzncfre.supabase.co",
    "https://*.supabase.co",
    "wss://sxzxyuxtqqflahzncfre.supabase.co",
    "wss://*.supabase.co",
    "https://www.highperformanceformat.com",
    "https://pl27701721.revenuecpmgate.com",
    "https://*.highperformanceformat.com",
    "https://*.revenuecpmgate.com"
  ],
  'media-src': [
    "'self'",
    "https://sxzxyuxtqqflahzncfre.supabase.co"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Add CSP meta tag to document head
 */
export function applyCSP(): void {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;

  // Remove existing CSP meta tag if present
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  // Create new CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPHeader();
  
  // Add to document head
  document.head.appendChild(meta);
}

/**
 * Security headers that should be set server-side
 * These are documented here for reference when deploying
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};