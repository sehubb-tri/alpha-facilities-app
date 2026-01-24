-- ============================================
-- ZONE PHOTOS TABLE - Run this in Supabase SQL Editor
-- ============================================

-- CREATE ZONE_PHOTOS TABLE
-- Stores photos taken during audits, tagged with zone and school info
CREATE TABLE IF NOT EXISTS zone_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Audit context
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,

  -- Location tagging
  campus TEXT NOT NULL,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,

  -- Auditor info
  auditor TEXT,

  -- Photo data
  photo_url TEXT NOT NULL,
  photo_order INTEGER DEFAULT 1,  -- 1-5 for multiple photos

  -- Optional note
  note TEXT,

  -- Campus metadata
  campus_data JSONB DEFAULT '{}'
);

-- ENABLE RLS
ALTER TABLE zone_photos ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (development - allow all)
CREATE POLICY "Allow all inserts on zone_photos" ON zone_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on zone_photos" ON zone_photos FOR SELECT USING (true);
CREATE POLICY "Allow all updates on zone_photos" ON zone_photos FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on zone_photos" ON zone_photos FOR DELETE USING (true);

-- CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_zone_photos_audit_id ON zone_photos(audit_id);
CREATE INDEX IF NOT EXISTS idx_zone_photos_campus ON zone_photos(campus);
CREATE INDEX IF NOT EXISTS idx_zone_photos_zone_id ON zone_photos(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_photos_created_at ON zone_photos(created_at DESC);

-- ============================================
-- DONE! Zone photos table is ready.
-- ============================================
