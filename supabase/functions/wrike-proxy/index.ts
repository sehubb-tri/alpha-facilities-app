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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { endpoint, method = "GET", body, isAttachment } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[wrike-proxy] ${method} ${endpoint} ${isAttachment ? '(attachment)' : ''}`);

    // Build Wrike API request
    const wrikeUrl = `${WRIKE_API_BASE}${endpoint}`;
    let wrikeOptions: RequestInit;

    // Handle attachment requests - download photo and upload as file bytes
    if (isAttachment && body?.url) {
      console.log(`[wrike-proxy] Downloading photo from: ${body.url}`);

      try {
        // Download the image first
        const imageResponse = await fetch(body.url);
        if (!imageResponse.ok) {
          console.error(`[wrike-proxy] Failed to download image: ${imageResponse.status}`);
          return new Response(
            JSON.stringify({ error: `Failed to download image: ${imageResponse.status}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get the image as ArrayBuffer
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer], { type: imageResponse.headers.get('content-type') || 'image/jpeg' });

        console.log(`[wrike-proxy] Downloaded image: ${imageBuffer.byteLength} bytes`);

        // Create FormData with actual file content
        const formData = new FormData();
        const filename = body.filename || 'photo.jpg';
        formData.append('file', imageBlob, filename);

        wrikeOptions = {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${WRIKE_API_TOKEN}`,
            // Don't set Content-Type - let fetch set it with multipart boundary
          },
          body: formData,
        };

        // Make request to Wrike API
        const wrikeResponse = await fetch(wrikeUrl, wrikeOptions);
        const wrikeData = await wrikeResponse.json();

        console.log(`[wrike-proxy] Attachment response status: ${wrikeResponse.status}`);

        if (!wrikeResponse.ok) {
          console.error("[wrike-proxy] Wrike attachment error:", wrikeData);
          return new Response(
            JSON.stringify({
              error: wrikeData.errorDescription || wrikeData.error || "Wrike attachment failed",
              details: wrikeData
            }),
            {
              status: wrikeResponse.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }

        console.log(`[wrike-proxy] Attachment uploaded successfully`);
        return new Response(
          JSON.stringify(wrikeData),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (fetchError) {
        console.error("[wrike-proxy] Error fetching/uploading image:", fetchError);
        return new Response(
          JSON.stringify({ error: `Failed to process image: ${fetchError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Regular JSON request
      wrikeOptions = {
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
    }

    // Make request to Wrike API
    const wrikeResponse = await fetch(wrikeUrl, wrikeOptions);
    const wrikeData = await wrikeResponse.json();

    console.log(`[wrike-proxy] Response status: ${wrikeResponse.status}`);

    // Check for Wrike API errors
    if (!wrikeResponse.ok) {
      console.error("[wrike-proxy] Wrike API error:", wrikeData);
      return new Response(
        JSON.stringify({
          error: wrikeData.errorDescription || wrikeData.error || "Wrike API request failed",
          details: wrikeData
        }),
        {
          status: wrikeResponse.status,
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
