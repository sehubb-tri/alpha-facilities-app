# Wrike Integration Setup Guide

This guide will help you set up automatic Wrike ticket creation when audits are completed.

## Prerequisites

1. Wrike account with API access
2. Supabase project with Edge Functions enabled
3. (Optional) Resend account for email notifications

## Step 1: Get Your Wrike API Token

1. Log into Wrike
2. Go to **Account Settings** > **Apps & Integrations** > **API**
3. Click **"+ Create new"** under Permanent Access Tokens
4. Give it a name like "Alpha Facilities App"
5. Copy the token immediately (you won't see it again!)

## Step 2: Get Your Wrike Folder ID

1. Navigate to the folder/project in Wrike where you want intake tickets created
2. Look at the URL in your browser
3. The folder ID is the string after `id=` in the URL
   - Example: `https://www.wrike.com/open.htm?id=IEAAAAAQAAAAAA` → ID is `IEAAAAAQAAAAAA`

## Step 3: Set Up Supabase Edge Function

### Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link to your project
```bash
cd alpha-facilities-app
supabase link --project-ref wybxbrutuoohiujjyfry
```

### Set secrets
```bash
# Wrike credentials (required for ticket creation)
supabase secrets set WRIKE_API_TOKEN=your_wrike_token_here
supabase secrets set WRIKE_FOLDER_ID=your_folder_id_here

# Email credentials (optional, for email notifications)
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
```

### Deploy the Edge Function
```bash
supabase functions deploy on-audit-complete
```

## Step 4: Create Database Trigger

Run this SQL in your Supabase SQL Editor to automatically call the function when audits are saved:

```sql
-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_audit_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function
  PERFORM net.http_post(
    url := 'https://wybxbrutuoohiujjyfry.supabase.co/functions/v1/on-audit-complete',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_audit_insert ON audits;
CREATE TRIGGER on_audit_insert
  AFTER INSERT ON audits
  FOR EACH ROW
  EXECUTE FUNCTION notify_audit_complete();
```

## Step 5: Test the Integration

1. Complete a test audit in the app
2. Check your Wrike folder for the new task
3. Check the auditor's email (if Resend is configured)

## Troubleshooting

### Check Edge Function Logs
```bash
supabase functions logs on-audit-complete
```

### Verify Secrets Are Set
```bash
supabase secrets list
```

### Test Function Manually
You can test the function by calling it directly:
```bash
curl -X POST 'https://wybxbrutuoohiujjyfry.supabase.co/functions/v1/on-audit-complete' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"record": {"id": "test", "campus": "Test Campus", "status": "RED", ...}}'
```

## What Gets Created in Wrike

When an audit is completed, a Wrike task is created with:
- **Title**: `[STATUS] Campus Name - Daily QC Audit - Date`
- **Description**: Full audit details including defects, condition alerts, and photo links
- **Priority**: High for RED, Normal for AMBER, Low for GREEN

## Email Notifications (Optional)

If you set up Resend, the auditor will receive an email with:
- Status summary
- Audit details
- Defect count
- Photo count
