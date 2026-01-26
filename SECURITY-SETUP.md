# Security Checklist Setup

This is a hidden feature for testing the Security compliance checklist. Access it at `/security`.

## Supabase Table Setup

Run this SQL in your Supabase SQL Editor to create the security_audits table:

```sql
-- Security Audits table
CREATE TABLE security_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT,
  time TEXT,
  campus TEXT,
  campus_data JSONB,
  auditor TEXT,
  auditor_email TEXT,
  duration INTEGER,
  zone_results JSONB,
  zone_ratings JSONB,
  overall_rating TEXT,
  issues JSONB,
  total_issues INTEGER,
  open_issues INTEGER,
  instant_red_issues INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE security_audits ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all security_audits" ON security_audits FOR ALL USING (true);

-- Create index for faster campus queries
CREATE INDEX idx_security_audits_campus ON security_audits(campus);
CREATE INDEX idx_security_audits_created_at ON security_audits(created_at DESC);
```

## How to Access

Navigate to: `https://your-app-url.vercel.app/security`

This route is intentionally NOT linked from the home page so Jake can test it without affecting other users.

## Check Frequencies

1. **Daily Checks** - Perimeter walk, staffing coverage, exterior doors
2. **Weekly Checks** - Access control spot check, camera spot check
3. **Monthly Checks** - Incident review, camera system review, alarm test
4. **Annual Checks** - Guard credentials verification

## RAG Rating Rules

- **GREEN (World Class)**: All checks pass, no open issues
- **AMBER (At Risk)**: Up to 3 issues, each with owner and fix date within 45 days
- **RED (Not Meeting Standard)**: Any instant-red item failed, or exceeds issue limits

## Instant RED Items

These items cannot be Amber - a NO answer = automatic RED:
- Security post not staffed during open hours
- Coverage gaps over 15 minutes
- Exterior doors not properly secured
- Doors propped open that should be closed
- Forced entry or break-in this month
- Perimeter breach this month
- Guards without valid license
