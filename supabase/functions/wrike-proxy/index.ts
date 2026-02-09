// Supabase Edge Function: wrike-proxy
// Proxies requests to Wrike API to avoid CORS issues and keep API token secure

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WRIKE_API_BASE = "https://www.wrike.com/api/v4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Wrike API token from environment
    const WRIKE_API_TOKEN = Deno.env.get("WRIKE_API_TOKEN");

    if (!WRIKE_API_TOKEN) {
      console.error("WRIKE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Wrike API token not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { endpoint, method = "GET", body } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[wrike-proxy] ${method} ${endpoint}`);

    // Build Wrike API request
    const wrikeUrl = `${WRIKE_API_BASE}${endpoint}`;
    const wrikeOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${WRIKE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    // Add body for POST/PUT requests
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      wrikeOptions.body = JSON.stringify(body);
    }

    // Make request to Wrike API
    const wrikeResponse = await fetch(wrikeUrl, wrikeOptions);
    const wrikeData = await wrikeResponse.json();

    console.log(`[wrike-proxy] Response status: ${wrikeResponse.status}`);

    // Always return 200 from edge function so supabase client can read the body.
    // Include Wrike's actual status so the client can handle errors properly.
    if (!wrikeResponse.ok) {
      console.error("[wrike-proxy] Wrike API error:", JSON.stringify(wrikeData));
      return new Response(
        JSON.stringify({
          error: wrikeData.errorDescription || wrikeData.error || "Wrike API request failed",
          wrikeStatus: wrikeResponse.status,
          details: wrikeData
        }),
        {
          status: 200, // Always 200 so supabase.functions.invoke returns data, not error
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify(wrikeData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[wrike-proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
