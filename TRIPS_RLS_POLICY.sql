-- =====================================================
-- RLS POLICIES FOR TRIPS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor to fix route snapshot updates
-- =====================================================

-- Enable RLS on trips table (if not already enabled)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;
DROP POLICY IF EXISTS "Public can view all trips" ON trips;

-- 1. INSERT: Users can insert their own trips
CREATE POLICY "Users can insert their own trips"
ON trips
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- 2. SELECT: Users can view their own trips
CREATE POLICY "Users can view their own trips"
ON trips
FOR SELECT
USING (auth.uid()::text = user_id);

-- 3. UPDATE: Users can update their own trips
CREATE POLICY "Users can update their own trips"
ON trips
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 4. DELETE: Users can delete their own trips
CREATE POLICY "Users can delete their own trips"
ON trips
FOR DELETE
USING (auth.uid()::text = user_id);

-- 5. PUBLIC SELECT: Allow public to view all trips (for leaderboards)
--    IMPORTANT: This allows the dashboard to show leaderboards without authentication
CREATE POLICY "Public can view all trips"
ON trips
FOR SELECT
USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify policies were created correctly:

-- 1. Check all policies on trips table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'trips';

-- 2. Test if policies work (replace USER_ID with your actual UUID)
-- Should return 1 row
-- SELECT COUNT(*) FROM trips WHERE user_id = 'YOUR_USER_ID_HERE';

-- 3. Test UPDATE (should show updated snapshot URL)
-- UPDATE trips 
-- SET route_snapshot_url = 'https://test.com/image.jpg'
-- WHERE user_id = 'YOUR_USER_ID_HERE' 
-- AND started_at = '2025-10-13T02:56:47+00:00'
-- RETURNING route_snapshot_url;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. The iOS app MUST be using authenticated user sessions (not anon key alone)
-- 2. The user_id in the trips table MUST match auth.uid()
-- 3. If using service role key, RLS is bypassed (which is fine for admin operations)
-- 4. The "Public can view all trips" policy allows leaderboards to work
--    without requiring authentication on the dashboard
