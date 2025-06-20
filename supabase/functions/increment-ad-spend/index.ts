
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ad_id, spend_amount } = await req.json()

    // Update ad spend and order count
    const { data, error } = await supabase
      .from('ads')
      .update({ 
        current_spend: supabase.raw(`current_spend + ${spend_amount}`),
        total_orders: supabase.raw('total_orders + 1')
      })
      .eq('id', ad_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Check if ad should be auto-stopped due to budget
    if (data.current_spend >= data.budget_cap && data.budget_cap > 0) {
      await supabase
        .from('ads')
        .update({ 
          is_auto_stopped: true,
          status: 'paused'
        })
        .eq('id', ad_id)
    }

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0]
    
    await supabase
      .from('ad_analytics')
      .upsert({
        ad_id: ad_id,
        date: today,
        orders: supabase.raw('COALESCE(orders, 0) + 1'),
        spend: supabase.raw(`COALESCE(spend, 0) + ${spend_amount}`)
      }, {
        onConflict: 'ad_id,date'
      })

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
