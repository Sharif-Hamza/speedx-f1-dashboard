-- ============================================
-- FINAL FIX - EVERYTHING (Safe Version)
-- ============================================

-- Drop ALL existing policies first to clean slate
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can do everything on profiles" ON public.user_profiles;

-- 1. Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. Allow users to view their own profile even if not approved
CREATE POLICY "Users can view own profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- 4. Service role can do everything
CREATE POLICY "Service role can do everything on profiles" 
    ON public.user_profiles 
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Make sure waitlist table is wide open for testing
ALTER TABLE public.waitlist_users DISABLE ROW LEVEL SECURITY;

-- 6. Grant all permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.waitlist_users TO authenticated;
GRANT ALL ON public.waitlist_users TO anon;

-- DONE!
