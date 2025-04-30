
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
import { OpenAI } from 'https://esm.sh/openai@4.12.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    // Initialize OpenAI
    const openAI = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    // System message to provide context about the application
    const systemMessage = `
      You are an AI assistant for Pak Bazaar Connect, a B2B E-Commerce Platform connecting wholesalers and sellers in Pakistan.
      
      Key platform features:
      - User roles: Admin (approves roles), Wholesaler (sells products), Seller (buys products)
      - Wholesalers can create shops, list products, and create advertisements
      - Sellers can browse shops, view products, and place orders
      - Users can request role changes which require admin approval
      
      Answer user questions helpfully, professionally, and concisely about using the platform.
      If you don't know something specific about the platform, base your answer on standard e-commerce practices.
    `;

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

    const reply = completion.choices[0].message.content;

    // Store the chat in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // We don't want to block the response on database operations
    // so we don't await this
    supabase.from('chat_history').insert({
      user_id: req.headers.get('x-user-id') || null,
      message,
      reply,
    }).then((res) => {
      if (res.error) {
        console.error('Error saving chat:', res.error);
      }
    });

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
    return new Response(
      JSON.stringify({ error: error.message }),
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
