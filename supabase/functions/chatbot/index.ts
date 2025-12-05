
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";
import { OpenAI } from "https://esm.sh/openai@4.12.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Chatbot function called");
    const { message } = await req.json();
    console.log("Received message:", message);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      throw new Error('Supabase configuration is incomplete');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and verify user from JWT token (secure method)
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
      }
    } else {
      console.log("No auth header provided, proceeding as anonymous");
    }

    // Initialize OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      throw new Error('OpenAI API key not configured. Please contact support.');
    }

    const openAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    console.log("OpenAI client initialized");

    // System message to provide context about the application
    const systemMessage = `
      You are an AI assistant for Pak Bazaar Connect, a B2B E-Commerce Platform connecting wholesalers and sellers in Pakistan.
      
      Key platform features:
      - User roles: Admin (approves roles), Wholesaler (sells products), Seller (buys products)
      - Wholesalers can create shops, list products, and create advertisements
      - Sellers can browse shops, view products, and place orders
      - Users can request role changes which require admin approval
      
      Answer user questions professionally and concisely about using the platform.
      If you don't know something specific about the platform, base your answer on standard e-commerce practices.
      Always aim to provide helpful, actionable advice.
    `;

    console.log("Generating AI response with OpenAI...");
    
    // Generate AI response
    const completion = await openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("OpenAI response received");
    const reply = completion.choices[0].message.content;
    console.log("Generated response successfully:", reply?.substring(0, 50) + "...");

    // Store the chat in the database (only for authenticated users)
    if (userId) {
      try {
        const { data, error } = await supabase.from('chat_history').insert({
          user_id: userId,
          message,
          reply,
        }).select();
        
        if (error) {
          console.error('Error saving chat:', error);
        } else {
          console.log('Chat saved successfully:', data[0].id);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    } else {
      console.log('Skipping chat history save for anonymous user');
    }

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: Deno.env.get('SUPABASE_ENV') === 'development' ? errorStack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
