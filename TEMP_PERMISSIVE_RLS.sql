-- TEMPORARY PERMISSIVE RLS POLICIES
-- This allows ALL authenticated users to insert/view data
-- Use this to get the app working, then tighten security later

-- ============================================
-- FIX BLITZ_POINTS TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own blitz points" ON blitz_points;
DROP POLICY IF EXISTS "Anyone can view blitz points" ON blitz_points;
DROP POLICY IF EXISTS "Users can update their own blitz points" ON blitz_points;
DROP POLICY IF EXISTS "Users can insert their own points" ON blitz_points;
DROP POLICY IF EXISTS "Users can view all points" ON blitz_points;
DROP POLICY IF EXISTS "Public can view all points" ON blitz_points;

-- Enable RLS
ALTER TABLE blitz_points ENABLE ROW LEVEL SECURITY;

-- ALLOW ALL AUTHENTICATED USERS TO INSERT (permissive)
CREATE POLICY "Authenticated users can insert blitz points"
ON blitz_points
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ALLOW EVERYONE TO VIEW (for leaderboards)
CREATE POLICY "Public can view all blitz points"
ON blitz_points
FOR SELECT
TO public
USING (true);

-- ALLOW ALL AUTHENTICATED USERS TO UPDATE (permissive)
CREATE POLICY "Authenticated users can update blitz points"
ON blitz_points
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON blitz_points TO anon;
GRANT SELECT ON blitz_points TO authenticated;
GRANT INSERT ON blitz_points TO authenticated;
GRANT UPDATE ON blitz_points TO authenticated;

-- ============================================
-- FIX ROUTE_REPLAYS TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own route replays" ON route_replays;
DROP POLICY IF EXISTS "Users can view their own route replays" ON route_replays;
DROP POLICY IF EXISTS "Users can update their own route replays" ON route_replays;
DROP POLICY IF EXISTS "Users can delete their own route replays" ON route_replays;
DROP POLICY IF EXISTS "Users can insert their own replays" ON route_replays;
DROP POLICY IF EXISTS "Users can view their own replays" ON route_replays;

-- Enable RLS
ALTER TABLE route_replays ENABLE ROW LEVEL SECURITY;

-- ALLOW ALL AUTHENTICATED USERS TO INSERT (permissive)
CREATE POLICY "Authenticated users can insert route replays"
ON route_replays
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ALLOW ALL AUTHENTICATED USERS TO VIEW (permissive)
CREATE POLICY "Authenticated users can view route replays"
ON route_replays
FOR SELECT
TO authenticated
USING (true);

-- ALLOW ALL AUTHENTICATED USERS TO UPDATE (permissive)
CREATE POLICY "Authenticated users can update route replays"
ON route_replays
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ALLOW ALL AUTHENTICATED USERS TO DELETE (permissive)
CREATE POLICY "Authenticated users can delete route replays"
ON route_replays
FOR DELETE
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON route_replays TO authenticated;

-- ============================================
-- VERIFY POLICIES WERE CREATED
-- ============================================

-- Run this to check policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('blitz_points', 'route_replays');
