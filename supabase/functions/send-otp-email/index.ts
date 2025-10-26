import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  userId: string;
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, email, name }: OTPEmailRequest = await req.json();

    if (!userId || !email) {
      throw new Error('Missing required fields: userId and email');
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_otp: otp,
        otp_expires_at: expiresAt.toISOString(),
        otp_attempts: 0
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to store OTP: ${updateError.message}`);
    }

    // In production, you would send an actual email here
    // For now, we'll log it (you can integrate with Resend or any email service)
    console.log(`OTP for ${email}: ${otp} (expires at ${expiresAt})`);

    // For development, return the OTP in the response
    // In production, remove this and only send via email
    const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verification code sent to ${email}`,
        // Only include OTP in development
        ...(isDevelopment && { otp, expiresAt })
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
