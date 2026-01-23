-- ============================================
-- ALPHA FACILITIES APP - SUPABASE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. CREATE AUDITS TABLE
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT,
  time TEXT,
  campus TEXT,
  auditor TEXT,
  status TEXT,
  defects INTEGER DEFAULT 0,
  zones INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  tour_ready BOOLEAN DEFAULT false,
  condition_alerts_count INTEGER DEFAULT 0,
  zone_results JSONB DEFAULT '{}',
  condition_alert_details JSONB DEFAULT '[]',
  campus_data JSONB DEFAULT '{}'
);

-- 2. CREATE REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timestamp TEXT,
  campus TEXT,
  photo TEXT,
  category TEXT,
  location TEXT,
  note TEXT,
  urgent BOOLEAN DEFAULT false,
  team TEXT,
  status TEXT DEFAULT 'open',
  campus_data JSONB DEFAULT '{}'
);

-- 3. CREATE STORAGE BUCKET FOR PHOTOS
-- Note: You may need to create this manually in Supabase Dashboard > Storage
-- Bucket name: photos
-- Make it PUBLIC for the app to access images

-- 4. DISABLE ROW LEVEL SECURITY (for development)
-- WARNING: Enable RLS with proper policies before going to production!
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES TO ALLOW ALL OPERATIONS (development only)
-- These allow anyone with the anon key to read/write
CREATE POLICY "Allow all inserts on audits" ON audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on audits" ON audits FOR SELECT USING (true);
CREATE POLICY "Allow all updates on audits" ON audits FOR UPDATE USING (true);

CREATE POLICY "Allow all inserts on reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow all updates on reports" ON reports FOR UPDATE USING (true);

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_campus ON audits(campus);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
