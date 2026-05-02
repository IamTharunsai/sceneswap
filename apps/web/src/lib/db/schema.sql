-- ============================================================
-- SceneSwap Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid  TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREATOR PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS creator_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name         TEXT NOT NULL,
  bio                  TEXT,
  niche                TEXT[] DEFAULT '{}',
  instagram_handle     TEXT,
  youtube_handle       TEXT,
  tiktok_handle        TEXT,
  follower_count       INTEGER DEFAULT 0,
  country              TEXT DEFAULT 'IN',
  state                TEXT,
  city                 TEXT,
  upi_id               TEXT,
  bank_account_number  TEXT,
  bank_ifsc            TEXT,
  total_earned         NUMERIC(12,2) DEFAULT 0,
  pending_payout       NUMERIC(12,2) DEFAULT 0,
  avatar_url           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRAND PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_name     TEXT NOT NULL,
  category       TEXT NOT NULL,
  gst_number     TEXT,
  logo_url       TEXT,
  website        TEXT,
  contact_name   TEXT NOT NULL,
  contact_phone  TEXT NOT NULL,
  wallet_balance NUMERIC(12,2) DEFAULT 0,
  total_spent    NUMERIC(12,2) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id           UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  description        TEXT,
  surface_preference TEXT NOT NULL CHECK (surface_preference IN ('wall', 'object', 'screen', 'apparel')),
  cpm_rate           NUMERIC(10,2) NOT NULL,
  total_budget       NUMERIC(12,2) NOT NULL,
  spent_amount       NUMERIC(12,2) DEFAULT 0,
  target_niches      TEXT[] DEFAULT '{}',
  target_regions     TEXT[] DEFAULT '{}',
  min_followers      INTEGER DEFAULT 0,
  start_date         DATE NOT NULL,
  end_date           DATE NOT NULL,
  brand_asset_url    TEXT NOT NULL,
  brand_asset_type   TEXT NOT NULL CHECK (brand_asset_type IN ('image', 'video', 'logo')),
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected')),
  allowed_categories TEXT[] DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREATOR CAMPAIGN ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS creator_campaign_assignments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id          UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
    'available', 'accepted', 'uploading', 'processing', 'rendering', 'ready', 'posted', 'completed', 'rejected'
  )),
  video_url           TEXT,
  rendered_video_url  TEXT,
  tracking_code       TEXT UNIQUE,
  post_url            TEXT,
  views_verified      INTEGER DEFAULT 0,
  earnings_amount     NUMERIC(12,2) DEFAULT 0,
  surface_zones       JSONB,
  selected_zone_id    TEXT,
  render_job_id       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, campaign_id)
);

-- ============================================================
-- VIDEO ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS video_analytics_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id   UUID NOT NULL REFERENCES creator_campaign_assignments(id) ON DELETE CASCADE,
  tracking_code   TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('click', 'view', 'api_update')),
  ip_hash         TEXT,
  country         TEXT,
  region          TEXT,
  city            TEXT,
  device_type     TEXT,
  referrer        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id             UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL CHECK (type IN ('deposit', 'campaign_spend', 'refund')),
  amount               NUMERIC(12,2) NOT NULL,
  description          TEXT NOT NULL,
  razorpay_payment_id  TEXT,
  campaign_id          UUID REFERENCES campaigns(id),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREATOR PAYOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS creator_payouts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id         UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  amount             NUMERIC(12,2) NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  razorpay_payout_id TEXT,
  upi_id             TEXT,
  bank_account       TEXT,
  failure_reason     TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WAITLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('creator', 'brand')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_assignments_creator_id ON creator_campaign_assignments(creator_id);
CREATE INDEX IF NOT EXISTS idx_assignments_campaign_id ON creator_campaign_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON creator_campaign_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_tracking_code ON creator_campaign_assignments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_analytics_assignment_id ON video_analytics_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tracking_code ON video_analytics_events(tracking_code);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON video_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_brand_id ON wallet_transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator_id ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON creator_payouts(status);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_creator_profiles
  BEFORE UPDATE ON creator_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_brand_profiles
  BEFORE UPDATE ON brand_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_assignments
  BEFORE UPDATE ON creator_campaign_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_payouts
  BEFORE UPDATE ON creator_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all RLS (used in API routes)
-- These policies allow authenticated users to read their own data
-- Full RLS policies should be added based on auth integration
