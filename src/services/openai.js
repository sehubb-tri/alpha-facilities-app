// OpenAI Vision API service for analyzing facility issues

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Valid category IDs that match issueCategories.js
const VALID_CATEGORIES = [
  'cleaning', 'supplies', 'spill', 'trash', 'odor',
  'plumbing', 'electrical', 'hvac', 'damage',
  'safety', 'pest', 'other'
];

// Get API key from environment or localStorage (for runtime config)
const getApiKey = () => {
  // Check environment variable first (set at build time)
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  // Fall back to localStorage (can be set at runtime)
  return localStorage.getItem('openai_api_key');
};

export const setOpenAIKey = (key) => {
  localStorage.setItem('openai_api_key', key);
};

export const hasOpenAIKey = () => {
  return !!getApiKey();
};

/**
 * Analyze a facility issue photo using GPT-4 Vision
 * @param {string} imageBase64 - Base64 encoded image data (with or without data URL prefix)
 * @returns {Promise<{category: string, description: string, confidence: string}>}
 */
export const analyzeIssuePhoto = async (imageBase64) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in settings.');
  }

  // Ensure we have proper base64 format for the API
  let base64Data = imageBase64;
  if (imageBase64.startsWith('data:')) {
    base64Data = imageBase64; // Keep the full data URL
  } else {
    base64Data = `data:image/jpeg;base64,${imageBase64}`;
  }

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

IMPORTANT: Only output the JSON, no other text.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI analysis result');
    }

    // Validate the category
    if (!VALID_CATEGORIES.includes(result.category)) {
      result.category = 'other';
    }

    return {
      category: result.category,
      description: result.description || 'Issue detected',
      suggestedUrgent: result.suggestedUrgent || false,
      confidence: result.confidence || 'medium'
    };

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
};
