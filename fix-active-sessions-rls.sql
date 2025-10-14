-- Fix RLS policies for active_sessions table
-- This allows users to manage their own active sessions

-- Enable RLS on active_sessions (if not already enabled)
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own sessions" ON active_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON active_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON active_sessions;
DROP POLICY IF EXISTS "Anyone can view active sessions" ON active_sessions;

-- Allow users to insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON active_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id::uuid);

-- Allow users to update their own sessions (for heartbeats)
CREATE POLICY "Users can update their own sessions"
ON active_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

-- Allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON active_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id::uuid);

-- Allow anyone (including anon users viewing dashboard) to read active sessions
CREATE POLICY "Anyone can view active sessions"
ON active_sessions
FOR SELECT
TO public
USING (true);

-- Grant necessary permissions
GRANT SELECT ON active_sessions TO anon;
GRANT SELECT ON active_sessions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON active_sessions TO authenticated;
