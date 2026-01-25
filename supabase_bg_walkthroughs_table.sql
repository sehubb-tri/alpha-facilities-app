-- ============================================
-- B&G WALKTHROUGHS TABLE
-- Weekly Building & Grounds Quality Control
-- ============================================

-- Create the table
CREATE TABLE IF NOT EXISTS bg_walkthroughs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic info
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  campus TEXT NOT NULL,
  auditor TEXT NOT NULL,
  auditor_email TEXT NOT NULL,
  duration INTEGER, -- in minutes

  -- Ratings
  campus_rating TEXT, -- 'PASS' or 'FAIL'
  zone_ratings JSONB DEFAULT '{}', -- { zoneId: 'GREEN'|'AMBER'|'RED', ... }

  -- Results
  zone_results JSONB DEFAULT '{}', -- { zoneId: { checkId: true/false, ... }, ... }
  room_results JSONB DEFAULT '{}', -- { roomId: { checkId: true/false, ... }, ... }
  selected_rooms JSONB DEFAULT '{}', -- { classrooms: [...], bathrooms: [...] }

  -- Issues and observations
  issues JSONB DEFAULT '[]', -- Array of issue objects with photos
  observations JSONB DEFAULT '[]', -- Array of observation objects routed to other pillars
  exit_photos JSONB DEFAULT '{}', -- { zoneId: photoUrl, ... }

  -- Counts
  total_issues INTEGER DEFAULT 0,
  total_observations INTEGER DEFAULT 0,
  green_zones INTEGER DEFAULT 0,
  amber_zones INTEGER DEFAULT 0,
  red_zones INTEGER DEFAULT 0,

  -- Campus metadata
  campus_data JSONB DEFAULT '{}',

  -- Timestamps
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bg_walkthroughs_campus ON bg_walkthroughs(campus);
CREATE INDEX IF NOT EXISTS idx_bg_walkthroughs_created_at ON bg_walkthroughs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bg_walkthroughs_auditor_email ON bg_walkthroughs(auditor_email);
CREATE INDEX IF NOT EXISTS idx_bg_walkthroughs_campus_rating ON bg_walkthroughs(campus_rating);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_bg_walkthroughs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bg_walkthroughs_updated_at ON bg_walkthroughs;
CREATE TRIGGER bg_walkthroughs_updated_at
  BEFORE UPDATE ON bg_walkthroughs
  FOR EACH ROW
  EXECUTE FUNCTION update_bg_walkthroughs_updated_at();

-- Enable Row Level Security (optional, uncomment if needed)
-- ALTER TABLE bg_walkthroughs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (optional, uncomment if needed)
-- CREATE POLICY "Allow all for authenticated users" ON bg_walkthroughs
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON bg_walkthroughs TO authenticated;
-- GRANT ALL ON bg_walkthroughs TO service_role;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE bg_walkthroughs IS 'Weekly Building & Grounds walkthrough records';
COMMENT ON COLUMN bg_walkthroughs.campus_rating IS 'PASS (>=85% GREEN + zero Tier 1) or FAIL';
COMMENT ON COLUMN bg_walkthroughs.zone_ratings IS 'JSON object mapping zone IDs to GREEN/AMBER/RED';
COMMENT ON COLUMN bg_walkthroughs.issues IS 'Array of issue objects: {zoneId, checkId, checkText, tier, photos[], notes, roomId?}';
COMMENT ON COLUMN bg_walkthroughs.observations IS 'Array of observations routed to other pillars: {category, pillar, tier, description, photos[]}';
COMMENT ON COLUMN bg_walkthroughs.exit_photos IS 'JSON object mapping zone IDs to exit photo URLs for GREEN zones';
