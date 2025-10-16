-- CHECK HOW OTHER WORKING TABLES ARE CONFIGURED
-- This will show us what policies work on tables like trips, active_sessions, etc.

-- 1. Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check existing policies on ALL tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check table permissions
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('blitz_points', 'route_replays', 'trips', 'active_sessions', 'blitz_stats')
ORDER BY table_name, grantee, privilege_type;
