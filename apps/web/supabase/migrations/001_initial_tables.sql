-- ============================================================
-- SceneSwap — Initial Tables
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Waitlist (creator + brand signups)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('creator', 'brand')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Creator testimonials (approved before showing publicly)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Founding brand inquiries
CREATE TABLE IF NOT EXISTS brand_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  category TEXT,
  budget TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_inquiries ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (your backend uses service_role key)
CREATE POLICY IF NOT EXISTS "service_role_all_waitlist"
  ON waitlist FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "service_role_all_testimonials"
  ON testimonials FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "service_role_all_brand_inquiries"
  ON brand_inquiries FOR ALL USING (true);

-- Public can read approved testimonials
CREATE POLICY IF NOT EXISTS "public_read_testimonials"
  ON testimonials FOR SELECT USING (approved = true);
