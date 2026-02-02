# Wrike Integration Setup Guide

## Step 1: Deploy the Edge Function

From your project root, run:

```bash
# If you haven't already, install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the wrike-proxy function
supabase functions deploy wrike-proxy
```

## Step 2: Set the Wrike API Token

In the Supabase Dashboard:

1. Go to your project
2. Click **Edge Functions** in the left sidebar
3. Click on **wrike-proxy**
4. Go to **Settings** tab
5. Under **Environment Variables**, add:
   - Name: `WRIKE_API_TOKEN`
   - Value: `YOUR_WRIKE_PERMANENT_ACCESS_TOKEN`

Or via CLI:
```bash
supabase secrets set WRIKE_API_TOKEN=YOUR_WRIKE_PERMANENT_ACCESS_TOKEN
```

## Step 3: Test the Connection

In your app's browser console, run:
```javascript
window.wrikeDebug.testWrikeConnection()
```

You should see: `[Wrike] Connection test successful. User: YourFirstName`

## Step 4: Configure Campus Folders

Edit `src/services/wrikeService.js` and update `CAMPUS_FOLDER_MAP`:

```javascript
const CAMPUS_FOLDER_MAP = {
  "Campus Name Here": "WRIKE_FOLDER_ID",
  // Add more campuses...
};
```

### Finding Folder IDs

1. In Wrike, open the target folder
2. Copy the numeric ID from the URL (e.g., `4360915958`)
3. In your app's browser console, run:
   ```javascript
   window.wrikeDebug.getFolderFromPermalink("4360915958")
   ```
4. Use the returned alphanumeric ID (e.g., `MQAAAAED7kv2`)

## Step 5: Go Live

Once testing is complete, update `wrikeService.js`:

```javascript
// Change from:
const TESTING_MODE = true;

// To:
const TESTING_MODE = false;
```

## Troubleshooting

**"Wrike API token not configured"**
- The WRIKE_API_TOKEN secret isn't set. Check Supabase Edge Function settings.

**"CORS error"**
- Make sure you deployed the edge function (not calling Wrike directly).

**"Folder not found"**
- The folder ID might be wrong. Use `getFolderFromPermalink()` to get the correct v4 ID.

**"Unauthorized"**
- Your Wrike API token may be invalid or expired. Generate a new one in Wrike settings.
