-- QUICK FIX: Disable RLS on active_sessions
-- Since the iOS app doesn't use Supabase Auth (just stores user_id in UserDefaults),
-- we can't use auth.uid() for RLS policies. We'll disable RLS completely.

ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON active_sessions TO anon;
GRANT ALL ON active_sessions TO authenticated;
GRANT ALL ON active_sessions TO public;
