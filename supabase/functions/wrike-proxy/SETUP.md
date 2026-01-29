# Wrike Proxy Edge Function Setup

This Edge Function proxies requests from the frontend to the Wrike API, avoiding CORS issues.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Logged in to Supabase: `supabase login`
3. Wrike API token (from .env file: `VITE_WRIKE_API_TOKEN`)

## Deployment Steps

### 1. Link to your Supabase project (if not already done)

```bash
cd alpha-facilities-app
supabase link --project-ref wybxbrutuoohiujjyfry
```

### 2. Set the Wrike API token as a secret

Get the token from your .env file (VITE_WRIKE_API_TOKEN) and set it as a Supabase secret:

```bash
supabase secrets set WRIKE_API_TOKEN=your_wrike_api_token_here
```

For example:
```bash
supabase secrets set WRIKE_API_TOKEN=eyJ0dCI6InAiLCJhbGciOiJIUzI1NiIsInR2IjoiMiJ9...
```

### 3. Deploy the Edge Function

```bash
supabase functions deploy wrike-proxy --no-verify-jwt
```

Note: `--no-verify-jwt` allows the function to be called without Supabase auth (since we're authenticating via the Wrike token).

### 4. Test the deployment

You can test the function is working by running a Daily Clean checklist with the "TESTING - Copy of Ops P2 Template" campus and flagging at least one condition alert.

## Troubleshooting

### Check function logs
```bash
supabase functions logs wrike-proxy
```

### Test the function directly
```bash
curl -X POST https://wybxbrutuoohiujjyfry.supabase.co/functions/v1/wrike-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"endpoint":"/contacts?me=true","method":"GET"}'
```

### Common Issues

1. **"Wrike integration not configured"**: The WRIKE_API_TOKEN secret is not set. Run `supabase secrets set` again.

2. **"Invalid endpoint format"**: Make sure the endpoint starts with `/` (e.g., `/folders/123/tasks`)

3. **CORS errors**: The Edge Function should handle CORS, but if issues persist, check the corsHeaders in index.ts.

## How It Works

1. Frontend calls `supabase.functions.invoke('wrike-proxy', { body: { endpoint, method, body } })`
2. Edge Function receives the request
3. Edge Function adds the Wrike API token from Supabase secrets
4. Edge Function forwards the request to Wrike
5. Edge Function returns the Wrike response to the frontend

This keeps the Wrike API token secure (server-side only) and avoids CORS issues since the request to Wrike comes from Supabase's servers, not the browser.
