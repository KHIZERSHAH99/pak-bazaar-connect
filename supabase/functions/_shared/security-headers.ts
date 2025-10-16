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
