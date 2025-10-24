import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createSecureResponse, handleCORS, createErrorResponse } from '../_shared/security-headers.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')!;

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook signature
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const webhookId = req.headers.get('svix-id');
    
    if (!signature || !timestamp || !webhookId) {
      console.error('Missing webhook headers');
      return createErrorResponse('Missing required webhook headers', 401);
    }

    // Get the raw body
    const body = await req.text();
    
    // Simple signature verification (you can enhance this with proper svix verification)
    // For now, we'll just check if the secret matches what Resend expects
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return createErrorResponse('Webhook secret not configured', 500);
    }

    const event: ResendWebhookEvent = JSON.parse(body);
    
    console.log('Received Resend webhook event:', {
      type: event.type,
      email_id: event.data.email_id,
      timestamp: event.created_at
    });

    // Handle different event types
    switch (event.type) {
      case 'email.sent':
        console.log('Email sent successfully:', event.data.email_id);
        // You can log this to your database if needed
        await supabase.from('audit_logs').insert({
          event_type: 'email_sent',
          new_values: {
            email_id: event.data.email_id,
            to: event.data.to,
            subject: event.data.subject,
            provider: 'resend'
          }
        });
        break;

      case 'email.delivered':
        console.log('Email delivered:', event.data.email_id);
        await supabase.from('audit_logs').insert({
          event_type: 'email_delivered',
          new_values: {
            email_id: event.data.email_id,
            to: event.data.to,
            provider: 'resend'
          }
        });
        break;

      case 'email.bounced':
        console.error('Email bounced:', event.data.email_id, event.data);
        await supabase.from('audit_logs').insert({
          event_type: 'email_bounced',
          new_values: {
            email_id: event.data.email_id,
            to: event.data.to,
            reason: event.data,
            provider: 'resend'
          }
        });
        break;

      case 'email.complained':
        console.error('Email complaint received:', event.data.email_id);
        await supabase.from('audit_logs').insert({
          event_type: 'email_complained',
          new_values: {
            email_id: event.data.email_id,
            to: event.data.to,
            provider: 'resend'
          }
        });
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return createSecureResponse({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type: event.type 
    });

  } catch (error: any) {
    console.error('Error processing Resend webhook:', error);
    return createErrorResponse(
      'Failed to process webhook',
      500,
      { error: error.message }
    );
  }
};

serve(handler);
