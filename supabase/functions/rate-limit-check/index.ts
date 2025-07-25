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

interface RateLimitEntry {
  identifier: string;
  action: string;
  count: number;
  windowStart: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

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

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client identifier (IP or user ID)
    const clientIdentifier = identifier || req.headers.get('x-forwarded-for') || 'unknown';
    const key = `${clientIdentifier}:${action}`;
    
    // Get rate limit configuration
    const config = DEFAULT_LIMITS[action] || { maxRequests: maxRequests || 50, windowMinutes: windowMinutes || 60 };
    const windowMs = config.windowMinutes * 60 * 1000;
    const now = Date.now();

    // Clean up expired entries
    for (const [k, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart > windowMs) {
        rateLimitStore.delete(k);
      }
    }

    // Get current entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || (now - entry.windowStart) > windowMs) {
      // Create new window
      entry = {
        identifier: clientIdentifier,
        action,
        count: 1,
        windowStart: now
      };
    } else {
      // Increment count in current window
      entry.count++;
    }

    rateLimitStore.set(key, entry);

    // Check if limit exceeded
    const isAllowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = entry.windowStart + windowMs;

    // Log rate limit violations
    if (!isAllowed) {
      console.log(`Rate limit exceeded for ${clientIdentifier} on action ${action}`);
      
      // Log to audit table
      try {
        await supabase.rpc('log_audit_event', {
          p_user_id: null,
          p_event_type: 'rate_limit_exceeded',
          p_new_values: JSON.stringify({
            action,
            identifier: clientIdentifier,
            count: entry.count,
            limit: config.maxRequests,
            windowMinutes: config.windowMinutes
          })
        });
      } catch (error) {
        console.error('Failed to log rate limit violation:', error);
      }
    }

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        remaining,
        resetTime,
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
      JSON.stringify({
        error: 'Internal server error',
        allowed: true // Fail open for availability
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});