/**
 * Security headers for edge functions
 */
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * CORS headers
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Combined headers
 */
export const defaultHeaders = {
  ...securityHeaders,
  ...corsHeaders,
  'Content-Type': 'application/json',
};

/**
 * Create response with security headers
 */
export function createSecureResponse(
  body: any,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...defaultHeaders,
        ...additionalHeaders,
      },
    }
  );
}

/**
 * Handle OPTIONS request
 */
export function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Create error response with security headers
 */
export function createErrorResponse(
  message: string,
  status = 400,
  details?: any
): Response {
  return createSecureResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status
  );
}

/**
 * Allow-listed origins for browser-callable edge functions.
 * Set ALLOWED_ORIGINS as a comma-separated env var to extend at runtime.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://pakm.lovable.app',
  'https://pakbazaarconnect.store',
  'https://www.pakbazaarconnect.store',
  'https://id-preview--89eda530-cc28-4019-810d-813b0af072c7.lovable.app',
];

function getAllowedOrigins(): string[] {
  const extra = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

/**
 * Validate the request Origin/Referer against the allow-list.
 * Returns null if valid, or a 403 Response if not.
 * Skips check entirely for non-state-changing methods.
 */
export function validateRequestOrigin(req: Request): Response | null {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return null;
  }
  const origin = req.headers.get('origin') ?? '';
  const referer = req.headers.get('referer') ?? '';
  const allowed = getAllowedOrigins();

  const isAllowed =
    (origin && allowed.some((o) => origin === o)) ||
    (referer && allowed.some((o) => referer.startsWith(o + '/') || referer === o));

  if (!isAllowed) {
    return createErrorResponse('Forbidden: invalid origin', 403);
  }
  return null;
}
