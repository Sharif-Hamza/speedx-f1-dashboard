-- ============================================
-- SpeedX Dashboard - Waitlist System Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. WAITLIST USERS TABLE
-- ============================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_users_email ON public.waitlist_users(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_status ON public.waitlist_users(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_created_at ON public.waitlist_users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_auth_user_id ON public.waitlist_users(auth_user_id);

-- Enable RLS
ALTER TABLE public.waitlist_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own waitlist status"
    ON public.waitlist_users
    FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own waitlist entry"
    ON public.waitlist_users
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all waitlist users"
    ON public.waitlist_users
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can update waitlist users"
    ON public.waitlist_users
    FOR UPDATE
    USING (true);

-- ============================================
-- 2. USER PROFILES TABLE (Extended)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    waitlist_approved BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes after table creation
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. AUTO-UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_waitlist_users_updated_at
    BEFORE UPDATE ON public.waitlist_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. FUNCTION TO APPROVE WAITLIST USER
-- ============================================
CREATE OR REPLACE FUNCTION approve_waitlist_user(
    waitlist_user_id UUID,
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    -- Update waitlist status
    UPDATE public.waitlist_users
    SET 
        status = 'approved',
        reviewed_by = admin_email,
        reviewed_at = NOW()
    WHERE id = waitlist_user_id
    RETURNING auth_user_id INTO user_auth_id;
    
    -- Update user profile
    UPDATE public.user_profiles
    SET waitlist_approved = true
    WHERE user_id = user_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCTION TO REJECT WAITLIST USER
-- ============================================
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

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.waitlist_users TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;

GRANT ALL ON public.waitlist_users TO service_role;
GRANT ALL ON public.user_profiles TO service_role;

-- ============================================
-- 7. TRIGGER TO CREATE PROFILE ON WAITLIST SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION create_profile_on_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, waitlist_approved)
    VALUES (NEW.auth_user_id, NEW.email, NEW.full_name, false)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_waitlist_user_created
    AFTER INSERT ON public.waitlist_users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_on_waitlist_signup();

-- ============================================
-- NOTES
-- ============================================
-- 1. Users sign up for waitlist first (creates auth user + waitlist entry)
-- 2. Admins approve/reject from SpeedX Admin Dashboard
-- 3. Once approved, users can access the full dashboard
-- 4. User profiles are automatically created on waitlist signup
-- 5. Same credentials work for both web and mobile app
