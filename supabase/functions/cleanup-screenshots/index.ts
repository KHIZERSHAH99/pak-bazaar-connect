import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function requireAdmin(req: Request): Promise<void> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    throw new Error('Unauthorized: missing authentication token')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  )

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    throw new Error('Unauthorized: invalid authentication token')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Unauthorized: profile not found')
  }

  if (profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required')
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await requireAdmin(req);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting screenshot cleanup process...')

    // Call the cleanup function
    const { error: functionError } = await supabase.rpc('cleanup_old_screenshots')
    
    if (functionError) {
      console.error('Error calling cleanup function:', functionError)
      throw functionError
    }

    // Additional cleanup: Remove orphaned storage objects
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const { data: oldObjects, error: listError } = await supabase
      .storage
      .from('payment-screenshots')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing storage objects:', listError)
    } else if (oldObjects) {
      const objectsToDelete = oldObjects.filter(obj => 
        new Date(obj.created_at) < threeDaysAgo
      )

      if (objectsToDelete.length > 0) {
        const pathsToDelete = objectsToDelete.map(obj => obj.name)
        
        const { error: deleteError } = await supabase
          .storage
          .from('payment-screenshots')
          .remove(pathsToDelete)

        if (deleteError) {
          console.error('Error deleting old objects:', deleteError)
        } else {
          console.log(`Deleted ${pathsToDelete.length} old screenshot files`)
        }
      }
    }

    console.log('Screenshot cleanup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Screenshot cleanup completed',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Screenshot cleanup error:', error)

    if (error instanceof Error && (error.message.startsWith('Unauthorized') || error.message.startsWith('Forbidden'))) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: error.message.startsWith('Forbidden') ? 403 : 401,
        },
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Screenshot cleanup failed';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})