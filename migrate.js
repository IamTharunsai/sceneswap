// One-time migration script — run once then delete
// Usage: node migrate.js
// Requires DATABASE_URL in .env.local (get from Supabase Dashboard → Settings → Database → URI)

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, 'apps/web/.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '')
}

const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL

if (!DATABASE_URL || DATABASE_URL.includes('your-')) {
  console.error(`
❌  DATABASE_URL not set.

Get it from:
  Supabase Dashboard → Project Settings → Database → Connection string (URI)

It looks like:
  postgresql://postgres.koiubkxhyhcnmjaskikl:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

Add it to apps/web/.env.local:
  DATABASE_URL=postgresql://postgres.koiubkxhyhcnmjaskikl:YOUR_PASSWORD@...

Then run: node migrate.js
`)
  process.exit(1)
}

const SQL = `
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('creator', 'brand')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_inquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='service_role_all_waitlist') THEN
    CREATE POLICY "service_role_all_waitlist" ON waitlist FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='service_role_all_testimonials') THEN
    CREATE POLICY "service_role_all_testimonials" ON testimonials FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='brand_inquiries' AND policyname='service_role_all_brand_inquiries') THEN
    CREATE POLICY "service_role_all_brand_inquiries" ON brand_inquiries FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='public_read_testimonials') THEN
    CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (approved = true);
  END IF;
END $$;
`

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log('✅  Connected to Supabase Postgres')
    await client.query(SQL)
    console.log('✅  Tables created: waitlist, testimonials, brand_inquiries')
    console.log('✅  RLS policies applied')
    console.log('\n🚀  Migration complete! You can delete migrate.js now.')
  } catch (err) {
    console.error('❌  Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
