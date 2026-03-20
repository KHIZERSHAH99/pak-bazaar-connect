import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { handleCORS, createSecureResponse, createErrorResponse } from '../_shared/security-headers.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🧹 Starting database cleanup...');

    // Run all cleanup functions
    const { data, error } = await supabase.rpc('run_all_cleanups');

    if (error) {
      console.error('❌ Cleanup failed:', error);
      return createErrorResponse('Database cleanup failed', 500, error);
    }

    // Get storage stats after cleanup
    const { data: stats, error: statsError } = await supabase.rpc('get_storage_stats');

    console.log('✅ Database cleanup completed:', JSON.stringify(data));
    if (stats) {
      console.log('📊 Storage stats:', JSON.stringify(stats));
    }

    return createSecureResponse({ 
      success: true, 
      message: 'Database cleanup completed',
      cleanup_results: data,
      storage_stats: stats || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});
