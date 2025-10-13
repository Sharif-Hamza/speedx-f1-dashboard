-- ============================================
-- SECURE FIX - PROPER RLS POLICIES
-- ============================================
-- This maintains security while allowing signups
-- ============================================

-- 1. DROP OLD POLICIES
DROP POLICY IF EXISTS "Users can view their own waitlist status" ON public.waitlist_users;
DROP POLICY IF EXISTS "Users can insert their own waitlist entry" ON public.waitlist_users;
DROP POLICY IF EXISTS "Admins can view all waitlist users" ON public.waitlist_users;
DROP POLICY IF EXISTS "Admins can update waitlist users" ON public.waitlist_users;
DROP POLICY IF EXISTS "Authenticated users can insert waitlist entry" ON public.waitlist_users;

-- 2. KEEP RLS ENABLED (for security)
ALTER TABLE public.waitlist_users ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SECURE POLICIES

-- Allow INSERT for authenticated users (including during signup)
CREATE POLICY "Allow authenticated insert"
    ON public.waitlist_users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = auth_user_id);

-- Allow INSERT for service role (for admin operations)
CREATE POLICY "Allow service role all"
    ON public.waitlist_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to view their own waitlist status
CREATE POLICY "Users can view own status"
    ON public.waitlist_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = auth_user_id);

-- Allow service role to view all (for admin dashboard)
CREATE POLICY "Service role can view all"
    ON public.waitlist_users
    FOR SELECT
    TO service_role
    USING (true);

-- Allow service role to update (for approvals/rejections)
CREATE POLICY "Service role can update"
    ON public.waitlist_users
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. GRANT PROPER PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.waitlist_users TO authenticated;
GRANT ALL ON public.waitlist_users TO service_role;

-- ============================================
-- NOTES
-- ============================================
-- ✅ Security is MAINTAINED
-- ✅ Users can only see their own waitlist entry
-- ✅ Users can only insert with their own auth_user_id
-- ✅ Service role (admin) can do everything
-- ✅ This is the PROPER way to handle RLS
