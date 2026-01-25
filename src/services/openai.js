// OpenAI Vision API service for analyzing facility issues
// Uses a secure Supabase Edge Function proxy - no API key needed on client

// Get the Supabase URL from environment
const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL;
};

// Check if AI analysis is available (Supabase must be configured)
export const hasOpenAIKey = () => {
  return !!getSupabaseUrl();
};

// Legacy function - no longer needed but kept for compatibility
export const setOpenAIKey = (key) => {
  console.warn('setOpenAIKey is deprecated. API keys are now managed server-side.');
};

/**
 * Analyze a facility issue photo using GPT-4 Vision via secure Edge Function
 * @param {string} imageBase64 - Base64 encoded image data (with or without data URL prefix)
 * @returns {Promise<{category: string, description: string, confidence: string, suggestedUrgent: boolean}>}
 */
export const analyzeIssuePhoto = async (imageBase64) => {
  const supabaseUrl = getSupabaseUrl();

  if (!supabaseUrl) {
    throw new Error('App not configured. Please contact your administrator.');
  }

  // Build the Edge Function URL
  const functionUrl = `${supabaseUrl}/functions/v1/analyze-photo`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the anon key for Supabase auth
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        image: imageBase64
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Analysis failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      category: result.category,
      description: result.description || 'Issue detected',
      suggestedUrgent: result.suggestedUrgent || false,
      confidence: result.confidence || 'medium'
    };

  } catch (error) {
    console.error('Photo analysis error:', error);
    throw error;
  }
};
