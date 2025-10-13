-- ============================================
-- WAITLIST FOR EXISTING SPEEDX DATABASE
-- ============================================
-- This works with your EXISTING user_profiles table
-- ============================================

-- 1. ADD waitlist_approved COLUMN TO EXISTING user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS waitlist_approved BOOLEAN DEFAULT true;

-- Set all existing users to approved (they already exist!)
UPDATE public.user_profiles SET waitlist_approved = true WHERE waitlist_approved IS NULL;

-- 2. CREATE WAITLIST_USERS TABLE
CREATE TABLE IF NOT EXISTS public.waitlist_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_users_email ON public.waitlist_users(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_status ON public.waitlist_users(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_auth_user_id ON public.waitlist_users(auth_user_id);

-- 3. DISABLE RLS ON WAITLIST (for now - we'll add proper policies after testing)
ALTER TABLE public.waitlist_users DISABLE ROW LEVEL SECURITY;

-- 4. GRANT PERMISSIONS
GRANT ALL ON public.waitlist_users TO authenticated;
GRANT ALL ON public.waitlist_users TO service_role;
GRANT ALL ON public.waitlist_users TO anon;

-- 5. APPROVAL FUNCTIONS
CREATE OR REPLACE FUNCTION approve_waitlist_user(
    waitlist_user_id UUID,
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    UPDATE public.waitlist_users
    SET 
        status = 'approved',
        reviewed_by = admin_email,
        reviewed_at = NOW()
    WHERE id = waitlist_user_id
    RETURNING auth_user_id INTO user_auth_id;
    
    -- Update user_profiles (using 'id' column, not 'user_id')
    UPDATE public.user_profiles
    SET waitlist_approved = true
    WHERE id = user_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_waitlist_user(
    waitlist_user_id UUID,
    admin_email TEXT,
    reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.waitlist_users
    SET 
        status = 'rejected',
        reviewed_by = admin_email,
        reviewed_at = NOW(),
        rejection_reason = reason
    WHERE id = waitlist_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER TO UPDATE PROFILE ON WAITLIST SIGNUP
CREATE OR REPLACE FUNCTION handle_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET waitlist_approved = false
    WHERE id = NEW.auth_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_waitlist_user_created ON public.waitlist_users;
CREATE TRIGGER on_waitlist_user_created
    AFTER INSERT ON public.waitlist_users
    FOR EACH ROW
    EXECUTE FUNCTION handle_waitlist_signup();

-- ============================================
-- DONE!
-- ============================================
-- Now waitlist works with your existing SpeedX database
-- All existing users have waitlist_approved = true
-- New users go through waitlist approval
