-- ============================================
-- COMPLETE FIX - Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS privacy_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- 2. Enable RLS
ALTER TABLE privacy_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies
DROP POLICY IF EXISTS "Public can view privacy policy" ON privacy_policy;
DROP POLICY IF EXISTS "Admins can update privacy policy" ON privacy_policy;
DROP POLICY IF EXISTS "Anyone can submit support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON support_requests;
DROP POLICY IF EXISTS "Anyone can submit data requests" ON data_requests;
DROP POLICY IF EXISTS "Admins can view data requests" ON data_requests;
DROP POLICY IF EXISTS "Admins can update data requests" ON data_requests;
DROP POLICY IF EXISTS "Public can insert data requests" ON data_requests;

-- 4. Create correct policies
-- Privacy Policy - anyone can read
CREATE POLICY "allow_read_privacy_policy"
  ON privacy_policy FOR SELECT
  USING (true);

-- Privacy Policy - admins can update
CREATE POLICY "allow_admin_update_privacy_policy"
  ON privacy_policy FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Support Requests - ANYONE can insert (including anonymous)
CREATE POLICY "allow_insert_support_requests"
  ON support_requests FOR INSERT
  WITH CHECK (true);

-- Support Requests - admins can read
CREATE POLICY "allow_admin_read_support_requests"
  ON support_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Support Requests - admins can update
CREATE POLICY "allow_admin_update_support_requests"
  ON support_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Data Requests - ANYONE can insert (including anonymous)
CREATE POLICY "allow_insert_data_requests"
  ON data_requests FOR INSERT
  WITH CHECK (true);

-- Data Requests - admins can read
CREATE POLICY "allow_admin_read_data_requests"
  ON data_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Data Requests - admins can update
CREATE POLICY "allow_admin_update_data_requests"
  ON data_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- 5. Grant permissions
GRANT ALL ON privacy_policy TO anon, authenticated, service_role;
GRANT ALL ON support_requests TO anon, authenticated, service_role;
GRANT ALL ON data_requests TO anon, authenticated, service_role;

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_created_at ON data_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_policy_last_updated ON privacy_policy(last_updated DESC);

-- 7. Insert default privacy policy if it doesn't exist
INSERT INTO privacy_policy (content)
SELECT '{
    "title": "Privacy Policy",
    "sections": [
      {"heading": "Introduction", "content": "SpeedX operates the SpeedX mobile application and website. This page explains how we collect, use, and protect information when you use our Service."},
      {"heading": "1. Information We Collect", "content": "We collect only what is needed to run SpeedX and improve your experience."},
      {"heading": "2. How We Use Collected Data", "content": "We do not sell or share your personal data for advertising."},
      {"heading": "3. Data Storage and Security", "content": "SpeedX uses Supabase for authentication, database management, and secure storage."},
      {"heading": "4. Location Data", "content": "With your permission, SpeedX may access GPS to compute drive distance, duration, and speed."},
      {"heading": "5. Responsible Use & Liability", "content": "SpeedX is intended for responsible driving and track/closed-course use only."},
      {"heading": "6. Children Privacy", "content": "SpeedX is not directed to children under 13."},
      {"heading": "7. Your Rights", "content": "You may request access, correction, or deletion of your data. Contact support@speedx.app."},
      {"heading": "8. Changes to This Policy", "content": "We may update this Policy periodically."},
      {"heading": "9. Contact Us", "content": "Questions about this Policy? Email support@speedx.app."},
      {"heading": "10. Legal Disclaimer", "content": "SpeedX is provided as is and as available. Use is at your own risk."}
    ]
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM privacy_policy LIMIT 1);

-- 8. Verify everything
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('privacy_policy', 'support_requests', 'data_requests');

SELECT 'Policies created:' as status;
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('privacy_policy', 'support_requests', 'data_requests')
ORDER BY tablename, policyname;

SELECT '✅ ALL DONE! Forms should work now!' as status;
