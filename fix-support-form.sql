-- ============================================
-- FIX SUPPORT FORM - Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if table exists
SELECT 'Checking if support_requests table exists...' as status;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'support_requests'
) as table_exists;

-- 2. Create table if it doesn't exist
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

-- 3. Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can submit support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON support_requests;
DROP POLICY IF EXISTS "allow_insert_support_requests" ON support_requests;
DROP POLICY IF EXISTS "allow_admin_read_support_requests" ON support_requests;
DROP POLICY IF EXISTS "allow_admin_update_support_requests" ON support_requests;

-- 5. Create NEW policies that allow anonymous inserts
-- CRITICAL: This policy allows ANYONE (including anonymous users) to insert
CREATE POLICY "allow_anonymous_insert_support_requests"
  ON support_requests
  FOR INSERT
  WITH CHECK (true);

-- This policy allows admins to read all support requests
CREATE POLICY "allow_admin_read_support_requests"
  ON support_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- This policy allows admins to update support requests
CREATE POLICY "allow_admin_update_support_requests"
  ON support_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()::text
    )
  );

-- 6. Grant necessary permissions
GRANT INSERT ON support_requests TO anon;
GRANT SELECT, UPDATE ON support_requests TO authenticated;
GRANT ALL ON support_requests TO service_role;

-- 7. Create index for performance
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);

-- 8. Verify setup
SELECT 'Current policies on support_requests:' as status;
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'support_requests';

-- 9. Test insert (should work without authentication)
SELECT 'Testing anonymous insert...' as status;
INSERT INTO support_requests (name, email, topic, message)
VALUES ('Test User', 'test@example.com', 'test', 'This is a test message with more than 20 characters to meet the minimum requirement.');

-- 10. Verify insert worked
SELECT 'Latest support request:' as status;
SELECT id, name, email, topic, LEFT(message, 50) as message_preview, status, created_at
FROM support_requests
ORDER BY created_at DESC
LIMIT 1;

-- 11. Clean up test data (optional)
-- DELETE FROM support_requests WHERE email = 'test@example.com';

SELECT '✅ ALL DONE! Support form should work now!' as status;
SELECT '🔍 Check the results above to verify everything is set up correctly.' as note;
