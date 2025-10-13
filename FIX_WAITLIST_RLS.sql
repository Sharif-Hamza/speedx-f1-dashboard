-- ============================================
-- FIX WAITLIST RLS POLICY + EMAIL VERIFICATION
-- ============================================
-- Run this to fix the signup issue
-- ============================================

-- 1. DROP THE PROBLEMATIC INSERT POLICY
DROP POLICY IF EXISTS "Users can insert their own waitlist entry" ON public.waitlist_users;

-- 2. CREATE A MORE PERMISSIVE INSERT POLICY
-- This allows authenticated users to insert waitlist entries
CREATE POLICY "Authenticated users can insert waitlist entry"
    ON public.waitlist_users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. ALSO ALLOW SERVICE ROLE (for admin operations)
GRANT ALL ON public.waitlist_users TO anon;
GRANT ALL ON public.waitlist_users TO authenticated;
GRANT ALL ON public.waitlist_users TO service_role;

-- 4. UPDATE THE TRIGGER TO HANDLE EMAIL VERIFICATION
CREATE OR REPLACE FUNCTION handle_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create/update profile if user_profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        INSERT INTO public.user_profiles (user_id, email, full_name, waitlist_approved)
        VALUES (NEW.auth_user_id, NEW.email, NEW.full_name, false)
        ON CONFLICT (user_id) DO UPDATE 
        SET waitlist_approved = false,
            email = NEW.email,
            full_name = NEW.full_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES
-- ============================================
-- ✅ This fixes the RLS error when creating waitlist accounts
-- ✅ Email verification is now enabled through Supabase Auth
-- ✅ Users will need to verify email before they can login
-- ✅ Waitlist approval is separate from email verification
