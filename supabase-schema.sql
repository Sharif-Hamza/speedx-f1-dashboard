-- ============================================
-- SpeedX Admin Features Schema (CORRECTED)
-- ============================================
-- This uses your EXISTING admin_users table
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Privacy Policy Table
CREATE TABLE IF NOT EXISTS privacy_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE privacy_policy ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view privacy policy"
  ON privacy_policy FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can update (uses existing admin_users table)
CREATE POLICY "Admins can update privacy policy"
  ON privacy_policy FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Insert default privacy policy
INSERT INTO privacy_policy (content) VALUES (
  '{
    "title": "Privacy Policy",
    "sections": [
      {
        "heading": "Introduction",
        "content": "SpeedX (\"we,\" \"our,\" or \"us\") operates the SpeedX mobile application (\"Service\") and website. This page explains how we collect, use, and protect information when you use our Service."
      },
      {
        "heading": "1. Information We Collect",
        "content": "We collect only what''s needed to run SpeedX and improve your experience.",
        "subsections": [
          {
            "heading": "1.1 Personal Data",
            "items": ["Email address (for account creation and authentication)", "Name or username (if you provide it)"]
          },
          {
            "heading": "1.2 Usage Data",
            "items": ["App interactions, session duration, performance metrics", "Trip statistics (total distance, total duration, top speed, average speed)", "Device type, operating system, and app version"]
          }
        ]
      },
      {
        "heading": "2. How We Use Collected Data",
        "items": ["Authenticate and maintain user accounts", "Store and display driving statistics", "Improve functionality, reliability, and performance", "Communicate updates and support information", "Diagnose issues and enhance usability"],
        "content": "We do not sell or share your personal data for advertising."
      },
      {
        "heading": "3. Data Storage and Security",
        "content": "SpeedX uses Supabase for authentication, database management, and secure storage.",
        "items": ["Your login data and driver statistics are stored on Supabase.", "Supabase applies encryption and secure access controls.", "By using SpeedX, you also agree to the Supabase Privacy Policy"],
        "note": "We take reasonable steps to safeguard your data, but no method of transmission or storage is 100% secure."
      },
      {
        "heading": "4. Location Data",
        "content": "With your permission, SpeedX may access GPS to compute drive distance, duration, and speed. You can revoke access anytime in device settings."
      },
      {
        "heading": "5. Responsible Use & Liability",
        "content": "SpeedX is intended for responsible driving and track/closed-course use only. We do not condone speeding or unsafe behavior. You are solely responsible for your driving. SpeedX assumes no liability for accidents, violations, or damages arising from use of the App. The analytics provided are informational only."
      },
      {
        "heading": "6. Children''s Privacy",
        "content": "SpeedX is not directed to children under 13, and we do not knowingly collect data from minors."
      },
      {
        "heading": "7. Your Rights",
        "content": "You may request access, correction, or deletion of your data. For data inquiries, contact support@speedx.app. We respond within a reasonable timeframe."
      },
      {
        "heading": "8. Changes to This Policy",
        "content": "We may update this Policy periodically. the \"Last Updated\" date reflects the latest version. Material changes may be announced in-app or via email."
      },
      {
        "heading": "9. Contact Us",
        "content": "Questions about this Policy or our data practices? Email support@speedx.app."
      },
      {
        "heading": "10. Legal Disclaimer",
        "content": "SpeedX is provided \"as is\" and \"as available.\" Use is at your own risk. We are not responsible for accidents, misuse of data, or third-party service interruptions (including Supabase)."
      }
    ]
  }'::jsonb
)
ON CONFLICT DO NOTHING;


-- 2. Support Requests Table
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

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous submissions
CREATE POLICY "Anyone can submit support requests"
  ON support_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view (uses existing admin_users table)
CREATE POLICY "Admins can view support requests"
  ON support_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Admins can update (uses existing admin_users table)
CREATE POLICY "Admins can update support requests"
  ON support_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );


-- 3. Data Requests Table
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

-- Enable RLS
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous submissions
CREATE POLICY "Anyone can submit data requests"
  ON data_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view (uses existing admin_users table)
CREATE POLICY "Admins can view data requests"
  ON data_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Admins can update (uses existing admin_users table)
CREATE POLICY "Admins can update data requests"
  ON data_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_created_at ON data_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_policy_last_updated ON privacy_policy(last_updated DESC);

-- Grant permissions
GRANT ALL ON privacy_policy TO authenticated;
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON data_requests TO authenticated;

GRANT ALL ON privacy_policy TO service_role;
GRANT ALL ON support_requests TO service_role;
GRANT ALL ON data_requests TO service_role;

-- Add comments
COMMENT ON TABLE privacy_policy IS 'Stores the current privacy policy content that can be edited by admins';
COMMENT ON TABLE support_requests IS 'Stores support form submissions from users';
COMMENT ON TABLE data_requests IS 'Stores data export/deletion requests from users';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('privacy_policy', 'support_requests', 'data_requests');

-- ============================================
-- NOTES
-- ============================================
-- ✅ Uses your existing admin_users table
-- ✅ No is_admin column needed on user_profiles
-- ✅ Checks admin_users.user_id against auth.uid()::text
-- ✅ Public can submit support/data requests
-- ✅ Only admins can view them
-- ✅ Privacy policy readable by everyone

-- ============================================
-- COMPLETE! 🎉
-- ============================================
