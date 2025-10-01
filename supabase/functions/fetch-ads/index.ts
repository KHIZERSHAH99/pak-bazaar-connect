import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'

// Adsterra Publisher API endpoint
const ADSTERRA_PUBLISHER_API = 'https://api.adsterra.com/v1'

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

    // For now, we'll use Adsterra's direct ad codes since the API token is for publisher stats
    // Adsterra ads work through JavaScript embed codes, not API calls for ad content
    
    // Map placements to Adsterra ad unit IDs
    const adsterraUnits: Record<string, any> = {
      'homepage-top': {
        id: 'atOptions-homepage-top',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'homepage-middle': {
        id: 'atOptions-homepage-middle', 
        key: 'e30a2bc2dccbb1f927dfa1de88c6da80',
        format: 'iframe',
        width: 300,
        height: 250
      },
      'homepage-bottom': {
        id: 'atOptions-homepage-bottom',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'products-top': {
        id: 'atOptions-products-top',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'products-bottom': {
        id: 'atOptions-products-bottom',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'products-sidebar': {
        id: 'atOptions-products-sidebar',
        key: 'dc821d5d4f93dd96c264f15f5eb69085',
        format: 'iframe', 
        width: 160,
        height: 600
      },
      'products-left-sidebar': {
        id: 'atOptions-products-left-sidebar',
        key: 'dc821d5d4f93dd96c264f15f5eb69085',
        format: 'iframe',
        width: 160,
        height: 600
      },
      'products-right-sidebar': {
        id: 'atOptions-products-right-sidebar',
        key: 'dc821d5d4f93dd96c264f15f5eb69085',
        format: 'iframe',
        width: 160,
        height: 600
      },
      'product-detail-top': {
        id: 'atOptions-product-detail-top',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'product-detail-bottom': {
        id: 'atOptions-product-detail-bottom',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'blog-top': {
        id: 'atOptions-blog-top',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      },
      'blog-bottom': {
        id: 'atOptions-blog-bottom',
        key: '987a9a316732abab62bdd80e2baaaa93',
        format: 'iframe',
        width: 728,
        height: 90
      }
    }

    // Get the ad unit configuration
    const adUnit = adsterraUnits[placement] || adsterraUnits['homepage-top']
    
    // Generate Adsterra ad code URL
    const adUrl = `//www.topcreativeformat.com/${adUnit.key}/invoke.js`
    
    // Log impression for analytics
    await supabase.from('ad_impressions').insert({
      ad_id: adUnit.key,
      placement,
      size,
      source: 'adsterra',
      created_at: new Date().toISOString()
    })

    // Return ad configuration for client-side rendering
    return new Response(
      JSON.stringify({
        success: true,
        source: 'adsterra',
        ad: {
          id: adUnit.id,
          key: adUnit.key,
          scriptUrl: adUrl,
          width: adUnit.width,
          height: adUnit.height,
          format: adUnit.format
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching ads:', error)
    
    // Return fallback configuration
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})