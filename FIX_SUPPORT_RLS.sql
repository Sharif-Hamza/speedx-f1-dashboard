-- FIX SUPPORT REQUESTS RLS POLICY
-- Run this in your Supabase SQL Editor NOW!

-- Option 1: Disable RLS completely for support_requests (EASIEST FIX)
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use this instead:
-- (Comment out Option 1 above and use this)

-- ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
-- 
-- -- Drop existing policies if any
-- DROP POLICY IF EXISTS "Allow anonymous inserts" ON support_requests;
-- DROP POLICY IF EXISTS "Allow public inserts" ON support_requests;
-- 
-- -- Create policy to allow anyone to insert support requests
-- CREATE POLICY "Allow anonymous inserts" ON support_requests
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);
-- 
-- -- Allow authenticated users too
-- CREATE POLICY "Allow authenticated inserts" ON support_requests
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);
-- 
-- -- Allow service role to do everything
-- CREATE POLICY "Allow service role all" ON support_requests
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- Verify the table exists and check current policies
SELECT * FROM support_requests LIMIT 1;
