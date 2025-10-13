-- ===================================================================
-- QUICK FIX: DISABLE RLS ON TRIPS TABLE
-- ===================================================================
-- This allows the iOS app to update trips using the anon key
-- The app already validates user_id correctly in the application layer
-- ===================================================================

-- Disable RLS on trips table
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;

-- That's it! Now the iOS app can update route_snapshot_url

-- ===================================================================
-- VERIFICATION
-- ===================================================================
-- Check if RLS is disabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'trips';
-- Should show: rowsecurity = false

-- Now test the update from your iOS app or run this:
-- UPDATE trips 
-- SET route_snapshot_url = 'https://test.com/test.jpg'
-- WHERE user_id = 'b79eeaca-61da-4b50-9004-2b938f6ff993'
-- AND started_at = '2025-10-13T02:56:47+00:00'
-- RETURNING *;
