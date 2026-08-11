import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  action: string;
  identifier?: string;
  maxRequests?: number;
  windowMinutes?: number;
}

// Default rate limits
const DEFAULT_LIMITS: Record<string, { maxRequests: number; windowMinutes: number }> = {
  'login': { maxRequests: 5, windowMinutes: 15 },
  'signup': { maxRequests: 3, windowMinutes: 60 },
  'password_reset': { maxRequests: 3, windowMinutes: 60 },
  'order_create': { maxRequests: 10, windowMinutes: 60 },
  'product_create': { maxRequests: 5, windowMinutes: 60 },
  'api_general': { maxRequests: 100, windowMinutes: 60 }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, identifier, maxRequests, windowMinutes }: RateLimitRequest = await req.json();

    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client identifier
    const clientIdentifier = identifier || req.headers.get('x-forwarded-for') || 'unknown';
    
    // Get rate limit configuration
    const config = DEFAULT_LIMITS[action] || { maxRequests: maxRequests || 50, windowMinutes: windowMinutes || 60 };

    // Use DB-backed rate limiting via secure function
    const { data: isAllowed, error } = await supabase.rpc('secure_check_rate_limit', {
      p_identifier: clientIdentifier,
      p_action: action,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open for availability
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log rate limit violations
    if (!isAllowed) {
      console.log(`Rate limit exceeded for ${clientIdentifier} on action ${action}`);
      
      try {
        await supabase.rpc('secure_insert_audit_log', {
          p_user_id: null,
          p_event_type: 'rate_limit_exceeded',
          p_table_name: null,
          p_record_id: null,
          p_old_values: null,
          p_new_values: JSON.stringify({
            action,
            identifier: clientIdentifier,
            limit: config.maxRequests,
            windowMinutes: config.windowMinutes
          }),
          p_user_agent: null
        });
      } catch (auditError) {
        console.error('Failed to log rate limit violation:', auditError);
      }
    }

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        windowMinutes: config.windowMinutes,
        maxRequests: config.maxRequests
      }),
      {
        status: isAllowed ? 200 : 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Rate limit check error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', allowed: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
