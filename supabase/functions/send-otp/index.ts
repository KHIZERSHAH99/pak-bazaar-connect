import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, type = 'signup' } = await req.json();
    
    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check for recent OTP requests (rate limiting)
    const { data: recentOtps } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phone)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // last hour
      .eq('is_verified', false);

    if (recentOtps && recentOtps.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP requests. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert({
        phone_number: phone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Spext API integration
    const spextApiKey = Deno.env.get('SPEXT_API_KEY')!;
    const spextUrl = 'https://api.spext.com/sms/send'; // Adjust based on actual Spext API endpoint
    
    const message = type === 'signup' 
      ? `Your Pakistan B2B verification code is: ${otp}. Valid for 5 minutes.`
      : `Your login verification code is: ${otp}. Valid for 5 minutes.`;

    // Create hash for authentication (if required by Spext)
    const timestamp = Math.floor(Date.now() / 1000);
    const dataToHash = `${phone}${message}${timestamp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash + spextApiKey);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Send SMS via Spext
    const spextResponse = await fetch(spextUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${spextApiKey}`,
        'X-API-Hash': hash,
        'X-Timestamp': timestamp.toString(),
      },
      body: JSON.stringify({
        to: phone,
        message: message,
        sender: 'PAK-B2B', // Adjust sender ID based on Spext requirements
      }),
    });

    if (!spextResponse.ok) {
      const errorText = await spextResponse.text();
      console.error('Spext API error:', errorText);
      
      // In development, still return success with OTP for testing
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'OTP sent successfully',
            otp: otp, // Only in development
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // Don't include OTP in production
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp }),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});