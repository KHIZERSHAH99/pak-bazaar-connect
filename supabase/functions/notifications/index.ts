
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestType = {
  userId: string;
  type: "role_change_request" | "role_approved" | "role_rejected";
  metadata?: Record<string, any>;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the request payload
    const { userId, type, metadata } = await req.json() as RequestType;

    if (!userId || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get the user's email
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Generate notification content based on the notification type
    let title = "";
    let message = "";
    
    switch (type) {
      case "role_change_request":
        title = "Role Change Request Submitted";
        message = `Your request to change your role to ${metadata?.requestedRole || "a new role"} has been submitted and is pending approval.`;
        break;
      
      case "role_approved":
        title = "Role Change Approved";
        message = `Your request to change your role to ${metadata?.approvedRole || "a new role"} has been approved. You can now access new features.`;
        break;
        
      case "role_rejected":
        title = "Role Change Request Rejected";
        message = `Your request to change your role to ${metadata?.requestedRole || "a new role"} was not approved at this time.`;
        break;
        
      default:
        title = "Notification";
        message = "You have a new notification from PakMandi.";
    }

    // In a real implementation, we would now send an email or push notification
    // For now, we'll just log the notification and save it to a notifications table
    console.log(`Notification for ${userData.email}:`, { title, message });
    
    // Add notification to a database table (if we had one)
    // For now, we'll just return success
    
    return new Response(
      JSON.stringify({
        success: true,
        user: userData.email,
        notification: { title, message },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error processing notification:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process notification';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
