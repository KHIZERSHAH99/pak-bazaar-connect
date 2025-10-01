import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'

const ADSTERRA_API_URL = 'https://api.adsterra.com/v2'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { placement, size, category } = await req.json()
    
    // Get Adsterra API token from environment
    const apiToken = Deno.env.get('ADSTERRA_API_TOKEN')
    if (!apiToken) {
      throw new Error('Adsterra API token not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch ad from Adsterra API
    const adsterraResponse = await fetch(`${ADSTERRA_API_URL}/banners`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!adsterraResponse.ok) {
      console.error('Adsterra API error:', await adsterraResponse.text())
      
      // Fallback to local ads from database
      const { data: localAds, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single()
      
      if (error || !localAds) {
        throw new Error('No ads available')
      }

      return new Response(
        JSON.stringify({
          success: true,
          source: 'local',
          ad: {
            id: localAds.id,
            headline: localAds.headline,
            image: localAds.image,
            url: `/ad-click/${localAds.id}`,
            type: 'display'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adsterraData = await adsterraResponse.json()
    
    // Transform Adsterra response to our format
    const ad = {
      id: adsterraData.id || crypto.randomUUID(),
      headline: adsterraData.title || 'Sponsored',
      image: adsterraData.image_url,
      url: adsterraData.click_url,
      type: adsterraData.format || 'display',
      impressionUrl: adsterraData.impression_url
    }

    // Log ad impression in database for analytics
    await supabase.from('ad_impressions').insert({
      ad_id: ad.id,
      placement,
      size,
      source: 'adsterra',
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({
        success: true,
        source: 'adsterra',
        ad
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching ads:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})