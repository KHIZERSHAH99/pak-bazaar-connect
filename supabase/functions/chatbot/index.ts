
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";
import { OpenAI } from "https://esm.sh/openai@4.12.4";
import { validateRequestOrigin } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGE_LENGTH = 1000;

function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // CSRF: enforce same-origin for state-changing requests
  const originErr = validateRequestOrigin(req);
  if (originErr) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log("Chatbot function called");
    const body = await req.json();
    const rawMessage = body?.message;

    // Input validation
    if (!rawMessage || typeof rawMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = sanitizeInput(rawMessage);

    if (message.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Received message length:", message.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      throw new Error('Supabase configuration is incomplete');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and verify user from JWT token
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError) {
        console.log("Auth error (user may be anonymous):", authError.message);
      } else if (user) {
        userId = user.id;
        console.log("Authenticated user:", userId);

        // DB-backed rate limiting for authenticated users
        const { data: allowed } = await supabase.rpc('secure_check_rate_limit', {
          p_identifier: userId,
          p_action: 'chatbot',
          p_max_requests: 20,
          p_window_minutes: 60
        });

        if (allowed === false) {
          return new Response(
            JSON.stringify({ error: 'Too many requests. Please wait before sending more messages.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
  } else {
      console.log("No auth header provided, applying anonymous rate limit");
      
      // IP-based rate limiting for anonymous users (stricter: 5 requests/hour)
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const { data: anonAllowed } = await supabase.rpc('secure_check_rate_limit', {
        p_identifier: `anon_ip_${clientIp}`,
        p_action: 'chatbot_anon',
        p_max_requests: 5,
        p_window_minutes: 60
      });

      if (anonAllowed === false) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please sign in for higher limits.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Initialize OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      throw new Error('OpenAI API key not configured. Please contact support.');
    }

    const openAI = new OpenAI({ apiKey: OPENAI_API_KEY });

    const systemMessage = `
      You are an AI assistant for PakMandi, a B2B E-Commerce Platform connecting wholesalers and sellers in Pakistan.
      
      Key platform features:
      - User roles: Admin (approves roles), Wholesaler (sells products), Seller (buys products)
      - Wholesalers can create shops, list products, and create advertisements
      - Sellers can browse shops, view products, and place orders
      - Users can request role changes which require admin approval
      
      Answer user questions professionally and concisely about using the platform.
      If you don't know something specific about the platform, base your answer on standard e-commerce practices.
      Always aim to provide helpful, actionable advice.
    `;

    const completion = await openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    console.log("Generated response successfully");

    // Store chat for authenticated users
    if (userId) {
      try {
        await supabase.from('chat_history').insert({
          user_id: userId,
          message,
          reply,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
