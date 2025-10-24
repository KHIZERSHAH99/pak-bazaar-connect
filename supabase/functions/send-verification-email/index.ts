import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthHookPayload {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to?: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: AuthHookPayload = await req.json();
    
    // Validate this is an auth hook payload
    if (!payload.user || !payload.email_data) {
      console.error('Invalid payload structure - not an auth hook request');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format. This endpoint only accepts Supabase Auth Hook payloads.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const email = payload.user.email;
    const token = payload.email_data.token_hash;
    const type = payload.email_data.email_action_type;
    const redirect_to = payload.email_data.redirect_to;

    console.log('Processing verification email request:', { email, type, user_role: payload.user.raw_user_meta_data?.role });

    // Check if this is a seller (retailer) - they don't need email verification
    const userRole = payload.user.raw_user_meta_data?.role;
    if (userRole === 'seller') {
      console.log('Skipping email verification for seller account:', email);
      
      await supabase.auth.admin.updateUserById(payload.user.id, {
        email_confirmed_at: new Date().toISOString()
      });
      console.log('Auto-confirmed seller account:', payload.user.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Seller account auto-confirmed',
          skipped: true 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if this is a phone-based account (dummy email)
    if (email.includes('@pakbazaarconnect.store') || 
        email.includes('@phone.auth') || 
        email.includes('@temp-phone-auth.com')) {
      console.log('Skipping email verification for phone-based account:', email);
      
      // Auto-confirm phone-based accounts
      const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (!getUserError && user) {
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirmed_at: new Date().toISOString()
        });
        console.log('Auto-confirmed phone-based account:', user.id);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone-based account auto-confirmed',
          skipped: true 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate verification link
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${type}${redirect_to ? `&redirect_to=${redirect_to}` : ''}`;

    console.log('Sending verification email to:', email);

    // Send verification email using Resend
    const emailResponse = await resend.emails.send({
      from: 'PakBazaar Connect <onboarding@resend.dev>',
      to: [email],
      subject: type === 'signup' ? 'Verify Your Email - PakBazaar Connect' : 'Confirm Email Change - PakBazaar Connect',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #1B5E20; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .button:hover { background: #2E7D32; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌐 PakBazaar Connect</h1>
                <p>Pakistan's B2B Marketplace</p>
              </div>
              <div class="content">
                <h2>Welcome to PakBazaar Connect!</h2>
                <p>Thank you for signing up. Please verify your email address to complete your registration and start connecting with wholesalers and sellers across Pakistan.</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This verification link expires in 24 hours. If you didn't create an account with PakBazaar Connect, please ignore this email.
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                
                <h3>What's Next?</h3>
                <ul style="color: #666;">
                  <li>Complete your business profile</li>
                  <li>Browse thousands of wholesale products</li>
                  <li>Connect with verified suppliers</li>
                  <li>Start growing your business</li>
                </ul>
              </div>
              <div class="footer">
                <p>© 2025 PakBazaar Connect. All rights reserved.</p>
                <p>Pakistan's trusted B2B marketplace connecting wholesalers and sellers.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);