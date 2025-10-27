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

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Pak Bazaar Connect <noreply@pakbazaarconnect.com>',
            to: [email],
            subject: 'Verify Your Email - Pak Bazaar Connect',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
                    .otp-box { background: #f5f5f5; border: 2px dashed #1B5E20; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #1B5E20; letter-spacing: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Email Verification</h1>
                      <p>Pak Bazaar Connect</p>
                    </div>
                    <div class="content">
                      <p>Hello${name ? ' ' + name : ''},</p>
                      <p>Thank you for registering with Pak Bazaar Connect! To complete your wholesaler account setup, please verify your email address.</p>
                      
                      <div class="otp-box">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code is:</p>
                        <div class="otp-code">${otp}</div>
                      </div>
                      
                      <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
                      <p>If you didn't request this verification, please ignore this email.</p>
                      
                      <div class="footer">
                        <p>© ${new Date().getFullYear()} Pak Bazaar Connect. All rights reserved.</p>
                        <p>Pakistan's Leading B2B E-Commerce Platform</p>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Resend API error:', errorData);
          throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
        }

        console.log(`OTP email sent successfully to ${email}`);
      } catch (emailError: any) {
        console.error('Error sending email via Resend:', emailError);
        // Continue anyway - OTP is stored in database
      }
    } else {
      console.log(`OTP for ${email}: ${otp} (expires at ${expiresAt}) - No RESEND_API_KEY configured`);
    }

    // For development, include OTP in response
    const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verification code sent to ${email}`,
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
