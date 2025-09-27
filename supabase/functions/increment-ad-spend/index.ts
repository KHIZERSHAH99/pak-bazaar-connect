
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

    const { ad_id, spend_amount, order_id } = await req.json()

    console.log('Processing ad spend increment:', { ad_id, spend_amount, order_id })

    // Get current ad data
    const { data: currentAd, error: fetchError } = await supabase
      .from('ads')
      .select('current_spend, budget_cap, is_auto_stopped, tracking_token, total_orders')
      .eq('id', ad_id)
      .single()

    if (fetchError) {
      console.error('Error fetching ad:', fetchError)
      throw fetchError
    }

    // Calculate new spend and order count
    const newSpend = (currentAd.current_spend || 0) + spend_amount
    const newOrderCount = (currentAd.total_orders || 0) + 1

    // Update ad spend and order count
    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .update({ 
        current_spend: newSpend,
        total_orders: newOrderCount
      })
      .eq('id', ad_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ad:', updateError)
      throw updateError
    }

    // Record the ad order
    if (order_id && currentAd.tracking_token) {
      const { error: adOrderError } = await supabase
        .from('ad_orders')
        .insert({
          ad_id: ad_id,
          order_id: order_id,
          tracking_token: currentAd.tracking_token,
          cost_charged: spend_amount
        })

      if (adOrderError) {
        console.error('Error recording ad order:', adOrderError)
        // Don't throw here as the main operation succeeded
      }
    }

    // Check if ad should be auto-stopped due to budget
    if (newSpend >= (currentAd.budget_cap || 0) && (currentAd.budget_cap || 0) > 0) {
      const { error: pauseError } = await supabase
        .from('ads')
        .update({ 
          is_auto_stopped: true,
          status: 'paused'
        })
        .eq('id', ad_id)

      if (pauseError) {
        console.error('Error auto-pausing ad:', pauseError)
      } else {
        console.log('Ad auto-paused due to budget cap')
      }
    }

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0]
    
    const { error: analyticsError } = await supabase
      .from('ad_analytics')
      .upsert({
        ad_id: ad_id,
        date: today,
        orders: 1,
        spend: spend_amount
      }, {
        onConflict: 'ad_id,date',
        ignoreDuplicates: false
      })

    if (analyticsError) {
      console.error('Error updating analytics:', analyticsError)
      // Don't throw here as the main operation succeeded
    }

    console.log('Ad spend increment completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedAd,
        new_spend: newSpend,
        new_order_count: newOrderCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to increment ad spend';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
