import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdsteeraAdRequest {
  zone_id?: string;
  format?: 'banner' | 'rectangle' | 'sidebar';
  width?: number;
  height?: number;
}

interface AdsteeraResponse {
  ad_code: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adsteeraToken = Deno.env.get('ADSTEERA_API_TOKEN');
    
    if (!adsteeraToken) {
      console.error('ADSTEERA_API_TOKEN not found');
      return new Response(
        JSON.stringify({ success: false, error: 'API token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { zone_id, format = 'banner', width = 728, height = 90 }: AdsteeraAdRequest = await req.json();

    console.log('Fetching Adsteera ad:', { zone_id, format, width, height });

    // Make request to Adsteera API - using correct endpoint
    const adsteeraResponse = await fetch('https://adsteera.com/api/get-ad', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adsteeraToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: zone_id || '5186568', // Use provided zone ID as default
        format: format,
        width: width,
        height: height,
        referrer: req.headers.get('referer') || '',
        user_agent: req.headers.get('user-agent') || '',
      }),
    });

    console.log('Adsteera request sent:', { zone_id: zone_id || '5186568', format, width, height });

    if (!adsteeraResponse.ok) {
      console.error('Adsteera API error:', adsteeraResponse.status, adsteeraResponse.statusText);
      
      // Return fallback ad content
      const fallbackAd = `
        <div style="width: ${width}px; height: ${height}px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 12px;">
          Advertisement Space
        </div>
      `;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          ad_code: fallbackAd,
          fallback: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const adData = await adsteeraResponse.json();
    console.log('Adsteera response received');

    return new Response(
      JSON.stringify({ 
        success: true, 
        ad_code: adData.ad_code || adData.html || '',
        zone_id: zone_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in adsteera-ads function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});