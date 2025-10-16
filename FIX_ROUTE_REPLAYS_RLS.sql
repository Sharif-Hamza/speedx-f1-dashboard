-- FIX RLS POLICY FOR ROUTE_REPLAYS TABLE
-- This allows authenticated users to save their route replays

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own replays" ON route_replays;
DROP POLICY IF EXISTS "Users can view their own replays" ON route_replays;
DROP POLICY IF EXISTS "Users can view all replays" ON route_replays;

-- Enable RLS on the table
ALTER TABLE route_replays ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own replays
CREATE POLICY "Users can insert their own route replays"
ON route_replays
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id::uuid);

-- Allow users to view their own replays
CREATE POLICY "Users can view their own route replays"
ON route_replays
FOR SELECT
TO authenticated
USING (auth.uid() = user_id::uuid);

-- Optional: Allow users to update their own replays
CREATE POLICY "Users can update their own route replays"
ON route_replays
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

-- Optional: Allow users to delete their own replays
CREATE POLICY "Users can delete their own route replays"
ON route_replays
FOR DELETE
TO authenticated
USING (auth.uid() = user_id::uuid);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON route_replays TO authenticated;
