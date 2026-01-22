# Alpha Facilities App

A mobile-first React application for facility quality control audits and issue reporting.

## Features

- **Daily QC Walkthrough**: Conduct facility audits with zone-by-zone checklists
- **See It, Report It**: Quick photo-based issue reporting
- **Supabase Backend**: All data syncs across users in real-time
- **Mobile-First Design**: Optimized for phone use in the field

## Quick Start

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click **"New Project"**
3. Enter a project name (e.g., `alpha-facilities`)
4. Set a database password (save this somewhere!)
5. Choose a region close to your users
6. Click **"Create new project"** (takes ~2 minutes)

### 2. Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run this:

```sql
-- Audits table
CREATE TABLE audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date TEXT,
  time TEXT,
  campus TEXT,
  auditor TEXT,
  status TEXT,
  defects INTEGER,
  zones INTEGER,
  duration INTEGER,
  tour_ready BOOLEAN,
  condition_alerts_count INTEGER,
  zone_results JSONB,
  condition_alert_details JSONB,
  campus_data JSONB
);

-- Reports table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  timestamp TEXT,
  campus TEXT,
  photo TEXT,
  category TEXT,
  location TEXT,
  note TEXT,
  urgent BOOLEAN,
  team TEXT,
  status TEXT,
  campus_data JSONB
);

-- Enable Row Level Security (but allow all for now)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all audits" ON audits FOR ALL USING (true);
CREATE POLICY "Allow all reports" ON reports FOR ALL USING (true);
```

### 3. Set Up Storage (for photos)

1. In Supabase, go to **Storage**
2. Click **"Create a new bucket"**
3. Name it `photos`
4. Toggle **"Public bucket"** ON
5. Click **"Create bucket"**

### 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string)

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Install & Run Locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Deploy to Vercel

1. Push this code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repo
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

## Project Structure

```
src/
├── components/       # Reusable UI components
├── data/            # Static data (campuses, zones, categories)
├── supabase/        # Supabase configuration and services
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── App.jsx          # Main app with routing
├── main.jsx         # Entry point
└── index.css        # Global styles with Tailwind
```

## Tech Stack

- **React** + Vite
- **Tailwind CSS** for styling
- **Supabase** for database and photo storage
- **React Router** for navigation

## Customization

### Adding/Editing Campuses
Edit `src/data/campuses.js`

### Adding/Editing Zones
Edit `src/data/zones.js`

### Adding/Editing Issue Categories
Edit `src/data/issueCategories.js`
