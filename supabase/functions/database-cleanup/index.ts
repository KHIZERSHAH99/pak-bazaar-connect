import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function createSecureResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...securityHeaders, ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function createErrorResponse(message: string, status = 400, details?: unknown): Response {
  return createSecureResponse({ error: message, ...(details !== undefined && { details }) }, status);
}

function handleCORS(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

async function requireAdmin(req: Request): Promise<{ userId: string }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    throw new Error('Unauthorized: missing authentication token');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    throw new Error('Unauthorized: invalid authentication token');
  }

  const userId = userData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('Unauthorized: profile not found');
  }

  if (profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required');
  }

  return { userId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    await requireAdmin(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting database cleanup...');

    const { data, error } = await supabase.rpc('run_all_cleanups');

    if (error) {
      console.error('Cleanup failed:', error);
      return createErrorResponse('Database cleanup failed', 500, error);
    }

    const { data: stats, error: statsError } = await supabase.rpc('get_storage_stats');

    console.log('Database cleanup completed:', JSON.stringify(data));
    if (stats) {
      console.log('Storage stats:', JSON.stringify(stats));
    }

    return createSecureResponse({
      success: true,
      message: 'Database cleanup completed',
      cleanup_results: data,
      storage_stats: stats || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cleanup error:', error);

    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return createErrorResponse(error.message, 401);
    }
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse('Internal server error', 500);
  }
});