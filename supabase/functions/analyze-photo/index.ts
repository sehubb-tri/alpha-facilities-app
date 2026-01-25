// Supabase Edge Function: analyze-photo
// Securely proxies OpenAI Vision API requests for facility issue analysis
// The OpenAI API key is stored as a Supabase secret, never exposed to clients

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Valid category IDs that match the app's issueCategories.js
const VALID_CATEGORIES = [
  'cleaning', 'supplies', 'spill', 'trash', 'odor',
  'plumbing', 'electrical', 'hvac', 'damage',
  'safety', 'pest', 'other'
]

const systemPrompt = `You are a facility maintenance issue analyzer. Analyze the photo and identify what type of facility issue it shows.

You MUST respond with valid JSON in this exact format:
{
  "category": "one of: cleaning, supplies, spill, trash, odor, plumbing, electrical, hvac, damage, safety, pest, other",
  "description": "A brief description of the issue (e.g., 'Leaky faucet dripping water' or 'Overflowing trash bin')",
  "suggestedUrgent": true or false,
  "confidence": "high, medium, or low"
}

Category definitions:
- cleaning: Dirty surfaces, stains, general uncleanliness
- supplies: Empty soap dispensers, paper towel holders, toilet paper
- spill: Liquid spills, wet floors
- trash: Overflowing trash cans, litter
- odor: Cannot be determined from photo alone - use only if context suggests
- plumbing: Leaks, clogged drains, toilet issues, faucet problems
- electrical: Broken lights, exposed wiring, outlet issues
- hvac: Temperature issues, broken vents, AC/heating problems
- damage: Broken furniture, wall damage, ceiling damage, broken fixtures
- safety: Trip hazards, blocked exits, missing safety equipment
- pest: Insects, rodents, pest droppings
- other: Anything that doesn't fit above categories

Set suggestedUrgent to true for: active water leaks, safety hazards, electrical issues, pest infestations.

IMPORTANT: Only output the JSON, no other text.`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment (Supabase secret)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'AI analysis service not configured. Please contact your administrator.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { image } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ensure we have proper base64 format for the API
    let base64Data = image
    if (!image.startsWith('data:')) {
      base64Data = `data:image/jpeg;base64,${image}`
    }

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this facility photo and identify the issue type:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Data,
                  detail: 'low' // Use low detail to save tokens/cost
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: errorData.error?.message || `AI service error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the JSON response
    let result
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the category
    if (!VALID_CATEGORIES.includes(result.category)) {
      result.category = 'other'
    }

    // Return the analysis result
    return new Response(
      JSON.stringify({
        category: result.category,
        description: result.description || 'Issue detected',
        suggestedUrgent: result.suggestedUrgent || false,
        confidence: result.confidence || 'medium'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
