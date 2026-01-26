# B&G Walkthrough Email Report Setup

This edge function sends an email report to the auditor when a B&G (Building & Grounds) walkthrough is completed.

**Supports two email providers:**
1. **Gmail API (Google Workspace)** - Recommended for organizations already using Google Workspace
2. **Resend** - Simpler setup, good fallback option

---

## Option 1: Google Workspace (Gmail API)

This method sends emails from a real Google Workspace account using a service account with domain-wide delegation.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**

### Step 2: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Give it a name (e.g., "Alpha Facilities Email")
4. Click **Create and Continue**
5. Skip the optional steps, click **Done**
6. Click on the newly created service account
7. Go to the **Keys** tab
8. Click **Add Key** > **Create new key** > **JSON**
9. Save the downloaded JSON file securely

### Step 3: Enable Domain-Wide Delegation

1. Still in the service account details, click **Show Advanced Settings**
2. Under **Domain-wide Delegation**, click **Enable G Suite Domain-wide Delegation**
3. Copy the **Client ID** shown

### Step 4: Authorize in Google Admin Console

1. Go to [Google Admin Console](https://admin.google.com/) (requires Workspace admin access)
2. Navigate to **Security** > **Access and data control** > **API Controls**
3. Click **Manage Domain Wide Delegation**
4. Click **Add new**
5. Enter the **Client ID** from Step 3
6. For OAuth Scopes, enter:
   ```
   https://www.googleapis.com/auth/gmail.send
   ```
7. Click **Authorize**

### Step 5: Set Supabase Secrets

```bash
cd alpha-facilities-app
supabase link --project-ref wybxbrutuoohiujjyfry

# Set the service account JSON (the entire contents of the downloaded file)
# Note: You need to escape the JSON properly or use a file
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"...@...iam.gserviceaccount.com",...}'

# Set the Workspace email address to send from
supabase secrets set GOOGLE_WORKSPACE_EMAIL=reports@yourschool.com
```

**Important:** The `GOOGLE_WORKSPACE_EMAIL` must be a real Google Workspace user in your domain. The service account will impersonate this user to send emails.

### Step 6: Deploy

```bash
supabase functions deploy send-bg-report
```

---

## Option 2: Resend (Simpler Alternative)

If you don't want to deal with Google Cloud setup, Resend is much simpler.

### Step 1: Get Your Resend API Key

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Go to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy the key (starts with `re_`)

### Step 2: (Optional) Verify Your Domain

For production, verify your domain in Resend to send from your own email address:
1. Go to **Domains** in Resend dashboard
2. Add your domain and follow the DNS verification steps

### Step 3: Set Supabase Secrets

```bash
cd alpha-facilities-app
supabase link --project-ref wybxbrutuoohiujjyfry

supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FROM_EMAIL=reports@yourdomain.com
```

### Step 4: Deploy

```bash
supabase functions deploy send-bg-report
```

---

## Testing the Function

### Manual Test

```bash
curl -X POST 'https://wybxbrutuoohiujjyfry.supabase.co/functions/v1/send-bg-report' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2024-01-15",
    "time": "10:30 AM",
    "campus": "Test Campus",
    "auditor": "Test Auditor",
    "auditorEmail": "your-email@example.com",
    "duration": 45,
    "campusRating": "PASS",
    "zoneRatings": {"entrance": "GREEN", "parking": "AMBER"},
    "issues": [],
    "observations": [],
    "totalIssues": 0,
    "totalObservations": 0,
    "greenZones": 8,
    "amberZones": 1,
    "redZones": 0
  }'
```

### Check Logs

```bash
supabase functions logs send-bg-report
```

### Verify Secrets

```bash
supabase secrets list
```

---

## Priority Order

The function checks for email providers in this order:
1. **Gmail API** - If `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_WORKSPACE_EMAIL` are set
2. **Resend** - If `RESEND_API_KEY` is set
3. **Error** - If neither is configured

If Gmail fails, it automatically falls back to Resend (if configured).

---

## Troubleshooting

### Gmail API Issues

**"Failed to get Google access token"**
- Verify the service account JSON is valid
- Check that domain-wide delegation is enabled
- Ensure the Client ID is authorized in Google Admin Console

**"Gmail API error: 403 Forbidden"**
- The workspace email doesn't have permission
- Domain-wide delegation scopes are incorrect
- The service account isn't authorized for this user

### Resend Issues

**"Resend API error: 401 Unauthorized"**
- API key is invalid or expired

**"Email not received"**
- Check spam folder
- Verify the FROM_EMAIL domain is verified in Resend

---

## Email Content

The email includes:
- Campus PASS/FAIL status with color-coded header
- Auditor name, date, time, and duration
- Zone summary (GREEN/AMBER/RED counts)
- Issues grouped by SLA tier
- Observations routed to other pillars
