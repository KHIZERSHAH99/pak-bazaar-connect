import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to convert Pakistani phone format
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // Convert 03XXXXXXXXX to 923XXXXXXXXX
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return '92' + cleaned.substring(1);
  }
  
  // Already in 92 format
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return cleaned;
  }
  
  // If starts with 3, add 92
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return '92' + cleaned;
  }
  
  return cleaned;
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

    console.log('Generating OTP for phone:', phone);

    // Check for recent OTP requests (rate limiting)
    const { data: recentOtps } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phone)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // last hour
      .eq('is_verified', false);

    if (recentOtps && recentOtps.length >= 3) {
      console.error('Rate limit exceeded for phone:', phone);
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

    console.log('OTP stored in database successfully');

    // Veevotech WhatsApp API integration
    const veetechHash = Deno.env.get('VEEVOTECH_API_HASH');
    const veetechUrl = 'http://wa-api.veevotech.com/wa/v1/send_message';
    
    if (!veetechHash) {
      console.error('VEEVOTECH_API_HASH not configured');
      // Return success with OTP for testing when API not configured
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP generated (WhatsApp not configured)',
          otp: otp,
          warning: 'WhatsApp API not configured - use OTP from console'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number for WhatsApp (92XXXXXXXXX)
    const whatsappPhone = formatPhoneForWhatsApp(phone);
    console.log('Formatted phone for WhatsApp:', whatsappPhone);
    
    const message = type === 'signup' 
      ? `Your Pakistan B2B verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`
      : `Your login verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

    // Send WhatsApp message via Veevotech
    try {
      const whatsappResponse = await fetch(veetechUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'hash': veetechHash,
        },
        body: JSON.stringify({
          to: whatsappPhone,
          type: 'text',
          text: message,
        }),
      });

      const responseText = await whatsappResponse.text();
      console.log('Veevotech API response status:', whatsappResponse.status);
      console.log('Veevotech API response:', responseText);

      if (!whatsappResponse.ok) {
        console.error('Veevotech API error:', responseText);
        
        // Return success with OTP for testing even if WhatsApp fails
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'OTP generated (WhatsApp delivery failed)',
            otp: otp,
            warning: 'WhatsApp message failed - use OTP from console'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('WhatsApp message sent successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent via WhatsApp successfully',
          // Include OTP in development for testing
          ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp }),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (whatsappError) {
      console.error('WhatsApp API connection error:', whatsappError);
      
      // Return success with OTP for testing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP generated (WhatsApp unavailable)',
          otp: otp,
          warning: 'WhatsApp service unavailable - use OTP from console'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});