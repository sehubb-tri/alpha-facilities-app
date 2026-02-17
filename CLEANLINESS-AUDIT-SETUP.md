# Cleanliness Weekly/Monthly Audit Setup

14.12 Quality Bar - Weekly & Monthly audits. Access at `/cleanliness`.

## Supabase Table Setup

Run this SQL in your Supabase SQL Editor to create the cleanliness_audits table:

```sql
-- Cleanliness Audits table (Weekly & Monthly)
-- 14.12 Quality Bar - Sean Hubbard
CREATE TABLE cleanliness_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT,
  time TEXT,
  campus TEXT,
  campus_data JSONB,
  auditor TEXT,
  auditor_email TEXT,
  duration INTEGER,
  checklist_type TEXT,          -- 'weekly' or 'monthly'
  checklist_name TEXT,          -- 'Weekly Audit' or 'Monthly Deep Dive'
  week_number INTEGER,          -- 1-4 (which week of month, for weekly audits)
  assigned_rooms JSONB,         -- rooms assigned for this week's audit
  check_results JSONB,          -- { checkId: true/false }
  overall_rating TEXT,          -- 'GREEN', 'AMBER', 'RED'
  issues JSONB,                 -- full issue array with photos as base64
  total_issues INTEGER,
  open_issues INTEGER,
  instant_red_issues INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE cleanliness_audits ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all cleanliness_audits" ON cleanliness_audits FOR ALL USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_cleanliness_audits_campus ON cleanliness_audits(campus);
CREATE INDEX idx_cleanliness_audits_created_at ON cleanliness_audits(created_at DESC);
CREATE INDEX idx_cleanliness_audits_type ON cleanliness_audits(checklist_type);
CREATE INDEX idx_cleanliness_audits_campus_type ON cleanliness_audits(campus, checklist_type);
```

## How to Access

Navigate to: `https://your-app-url.vercel.app/cleanliness`

## Audit Types

1. **Weekly Audit (20-30 min)** - Tour route (every week) + assigned rooms from campus map (rotating)
2. **Monthly Deep Dive (30-45 min)** - Deep inspection + vendor performance + 30-day review

## Room Rotation

- Rooms from the campus map are distributed across 4 weeks via round-robin
- Tour route gets checked every week (4x/month)
- All rooms get checked at least 1x/month
- Campus must have rooms defined in `campusRooms.js` for room assignments to appear

## RAG Rating Rules (Stricter than Security)

- **GREEN (World Class)**: All checks pass + Tour Ready = Yes
- **AMBER (At Risk)**: Exactly 1 non-critical defect, not restroom/safety, still tour ready, max 24h
- **RED (Not Meeting Standard)**: Any restroom defect, safety hazard, Tour Ready = No, 2+ defects, repeat defect

## Instant RED (Amber-Ineligible)

- ANY restroom defect (all 10 restroom checks)
- ANY safety/EHS hazard (standing water, blocked exits, exposed wiring, chemicals, pests, mold)
- Tour Ready = No
- Entry glass not clean (47-second arrival decision)
- Supply stockout during operating hours
- Repeat failure (same zone within 30 days)
- 2+ defects of any kind

## SLA Tiers

- **Tier 1 (Safety/EHS)**: Immediate response, same-day resolution
- **Tier 2 (Restroom/Parent-Facing)**: <4h response, <24h resolution
- **Tier 3 (Routine)**: <24h response, 5-day resolution
- **Tier 4 (Deep Clean)**: Scheduled, per cycle (monthly/quarterly/session break)

## Photo Storage

Photos are stored as base64 strings inside the `issues` JSONB column, same pattern as security_audits. Each issue object contains a `photos` array with base64 image data. No separate storage bucket needed for audit photos.
