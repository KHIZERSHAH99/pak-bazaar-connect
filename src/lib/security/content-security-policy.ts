/**
 * Content Security Policy configuration
 * Helps prevent XSS attacks by controlling what resources can be loaded
 */

const SUPABASE_DOMAIN = 'sxzxyuxtqqflahzncfre.supabase.co';

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'frame-src': [
    "'self'",
    "https://www.youtube.com",
    "https://player.vimeo.com",
    "https://www.dailymotion.com",
    "https://www.loom.com",
    "https://drive.google.com",
  ],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    `https://${SUPABASE_DOMAIN}`,
    "https://*.supabase.co",
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    `https://${SUPABASE_DOMAIN}`,
    "https://*.supabase.co",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    `https://${SUPABASE_DOMAIN}`,
    "https://*.supabase.co",
    `wss://${SUPABASE_DOMAIN}`,
    "wss://*.supabase.co",
  ],
  'media-src': [
    "'self'",
    "blob:",
    "data:",
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
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
 * Apply CSP meta tag to document head
 */
export function applyCSP(): void {
  if (typeof document === 'undefined') return;

  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPHeader();
  document.head.appendChild(meta);
}

/**
 * Security headers reference (set server-side via _headers file)
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};
