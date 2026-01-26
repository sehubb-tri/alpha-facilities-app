# Furniture & Decor Checklist Setup

This is a hidden feature for testing the Furniture & Decor quality bar (14.08). Access it at `/furniture`.

**Pillar Owners:** Taraya Voelker, Austin Ray

## Supabase Table Setup

Run this SQL in your Supabase SQL Editor to create the furniture_audits table:

```sql
-- Furniture Audits table
CREATE TABLE furniture_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT,
  time TEXT,
  campus TEXT,
  campus_data JSONB,
  auditor TEXT,
  auditor_email TEXT,
  duration INTEGER,
  checklist_type TEXT,
  checklist_name TEXT,
  check_results JSONB,
  rating TEXT,
  issues JSONB,
  total_issues INTEGER,
  open_issues INTEGER,
  instant_red_issues INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE furniture_audits ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all furniture_audits" ON furniture_audits FOR ALL USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_furniture_audits_campus ON furniture_audits(campus);
CREATE INDEX idx_furniture_audits_created_at ON furniture_audits(created_at DESC);
CREATE INDEX idx_furniture_audits_type ON furniture_audits(checklist_type);
```

## How to Access

Navigate to: `https://your-app-url.vercel.app/furniture`

This route is intentionally NOT linked from the home page so Taraya and Austin can test it without affecting other users.

## Check Frequencies

1. **Weekly Pulse Check** (15-20 min) - Quick visual scan by Guide or Facilities
   - Furniture Condition Scan (damage, wear, stains, functionality)
   - Usage Check (being used, appropriate use, arrangement)
   - Quick Safety Check (hazards, structural issues)

2. **Monthly Condition Scan** (45-60 min) - Detailed assessment by Facilities Staff
   - Detailed Furniture Assessment (desks, chairs, storage, soft seating)
   - Ergonomic Standards (adjustable chairs, desk height, monitor/keyboard space)
   - Safety Detailed Check (sharp edges, weight limits, tip hazards)
   - Decor & Brand Standards (signage, colors, wall condition)
   - Lighting & Environment (adequate light, burnt bulbs, flooring)

3. **Quarterly Deep Review** (60-90 min) - Comprehensive review by Facilities Manager
   - Satisfaction Review (guide and student feedback)
   - Special Spaces (labs, maker spaces, quiet rooms)
   - Biophilic & Comfort Elements (plants, natural light, temperature, noise)
   - Replacement Planning (identify, document, budget)

4. **Annual Comprehensive Review** (2-3 hours) - Full review by Facilities Manager + Leadership
   - Inventory Verification (exists, accurate, ages tracked)
   - Vendor & Warranty Review (warranties, vendor performance, contracts)
   - Strategic Planning (refresh plan, budget, standards)
   - Compliance & Accessibility (ADA, fire code, certifications)

## RAG Rating Rules

- **GREEN (World Class)**: All checks pass, 95%+ furniture in good condition, satisfaction 4.5+
- **AMBER (At Risk)**: Up to 3 issues with owner and fix date within 45 days, no instant RED items
- **RED (Not Meeting Standard)**: Any instant-red item failed, >3 issues, or issues >45 days old

## Instant RED Items

These items cannot be Amber - a NO answer = automatic RED:
- Safety hazards present
- Structural issues with furniture
- Sharp edges or exposed hardware
- Work chairs without adjustable height
- Desks not at appropriate working height

## Photo Requirements

Photos are required for physical condition issues:
- Damage, wear, stains
- Safety hazards and structural issues
- Sharp edges
- Signage condition
- Wall damage
- Lighting issues
- Flooring damage
- Special space conditions
