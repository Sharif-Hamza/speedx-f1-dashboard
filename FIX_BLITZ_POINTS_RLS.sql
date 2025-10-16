-- FIX RLS POLICY FOR BLITZ_POINTS TABLE
-- This allows authenticated users to insert their own points

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own points" ON blitz_points;
DROP POLICY IF EXISTS "Users can view all points" ON blitz_points;
DROP POLICY IF EXISTS "Public can view all points" ON blitz_points;
DROP POLICY IF EXISTS "Users can insert points" ON blitz_points;
DROP POLICY IF EXISTS "Anyone can view points" ON blitz_points;

-- Enable RLS on the table
ALTER TABLE blitz_points ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own records
CREATE POLICY "Users can insert their own blitz points"
ON blitz_points
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id::uuid);

-- Allow ANYONE to view all points (for dashboard/leaderboards)
CREATE POLICY "Anyone can view blitz points"
ON blitz_points
FOR SELECT
TO public
USING (true);

-- Optional: Allow users to update their own records
CREATE POLICY "Users can update their own blitz points"
ON blitz_points
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

-- Grant necessary permissions
GRANT SELECT ON blitz_points TO anon;
GRANT SELECT ON blitz_points TO authenticated;
GRANT INSERT ON blitz_points TO authenticated;
GRANT UPDATE ON blitz_points TO authenticated;
