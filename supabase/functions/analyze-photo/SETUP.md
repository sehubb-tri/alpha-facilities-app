# AI Photo Analysis Edge Function Setup

This Edge Function securely proxies OpenAI Vision API requests for facility issue analysis. The API key is stored server-side and never exposed to client devices.

## Setup Steps

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### 2. Add the API Key to Supabase Secrets

Using the Supabase CLI:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here
```

Or via the Supabase Dashboard:

1. Go to your project in the [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Project Settings** > **Edge Functions**
3. Click **Manage Secrets**
4. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

### 3. Deploy the Edge Function

```bash
cd alpha-facilities-app
supabase functions deploy analyze-photo
```

### 4. Verify Deployment

Test the function with curl:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-photo' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

## How It Works

1. User takes a photo in the app
2. App sends the base64 image to this Edge Function
3. Edge Function calls OpenAI Vision API with the securely stored key
4. OpenAI analyzes the image and returns category, description, urgency, and confidence
5. Edge Function returns the result to the app

## Security Benefits

- **API key never leaves the server** - clients cannot extract it
- **Centralized key management** - rotate the key anytime without updating the app
- **Rate limiting ready** - you can add rate limiting to this function if needed
- **Audit logging** - Supabase logs all function invocations

## Costs

This function uses GPT-4o with `detail: low` for image analysis. Approximate costs:
- ~$0.003 per image analyzed (may vary based on image size)

## Troubleshooting

**"AI analysis service not configured"**
- The `OPENAI_API_KEY` secret is not set in Supabase
- Run `supabase secrets list` to verify

**"AI service error: 401"**
- The API key is invalid or expired
- Generate a new key at platform.openai.com

**"AI service error: 429"**
- You've hit OpenAI rate limits
- Wait a few minutes or upgrade your OpenAI plan

**CORS errors**
- The function includes CORS headers for all origins
- If you need to restrict origins, modify `corsHeaders` in the function
