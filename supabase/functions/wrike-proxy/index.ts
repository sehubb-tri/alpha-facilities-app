// Supabase Edge Function: wrike-proxy
// Securely proxies Wrike API requests from the frontend
// The Wrike API token is stored as a Supabase secret, never exposed to clients

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WRIKE_API_BASE = 'https://www.wrike.com/api/v4'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Wrike API token from environment (Supabase secret)
    const WRIKE_API_TOKEN = Deno.env.get('WRIKE_API_TOKEN')

    if (!WRIKE_API_TOKEN) {
      console.error('WRIKE_API_TOKEN not configured in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'Wrike integration not configured. Please contact your administrator.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { endpoint, method = 'GET', body } = await req.json()

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'No endpoint provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate endpoint (basic security check)
    if (!endpoint.startsWith('/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the Wrike API URL
    const url = `${WRIKE_API_BASE}${endpoint}`
    console.log(`[Wrike Proxy] ${method} ${url}`)

    // Make the request to Wrike
    const wrikeResponse = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${WRIKE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
    })

    // Get response data
    const responseData = await wrikeResponse.json()

    if (!wrikeResponse.ok) {
      console.error('[Wrike Proxy] API error:', wrikeResponse.status, JSON.stringify(responseData))
      // Return 200 with error details so frontend can see the actual Wrike error
      return new Response(
        JSON.stringify({
          error: responseData.errorDescription || responseData.error || `Wrike API error: ${wrikeResponse.status}`,
          wrikeStatus: wrikeResponse.status,
          wrikeError: responseData
        }),
        {
          status: 200, // Return 200 so supabase client gives us the body
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Wrike Proxy] Success:', endpoint)

    // Return the Wrike response
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Wrike Proxy] Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
