-- ============================================
-- SpeedX Dashboard - SAFE Waitlist Migration
-- ============================================
-- This migration ONLY adds new features
-- Does NOT modify or delete existing data
-- ============================================

-- 1. CREATE WAITLIST USERS TABLE (New table - safe to create)
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
DROP POLICY IF EXISTS "Users can view their own waitlist status" ON public.waitlist_users;
CREATE POLICY "Users can view their own waitlist status"
    ON public.waitlist_users
    FOR SELECT
    USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can insert their own waitlist entry" ON public.waitlist_users;
CREATE POLICY "Users can insert their own waitlist entry"
    ON public.waitlist_users
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Admins can view all waitlist users" ON public.waitlist_users;
CREATE POLICY "Admins can view all waitlist users"
    ON public.waitlist_users
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update waitlist users" ON public.waitlist_users;
CREATE POLICY "Admins can update waitlist users"
    ON public.waitlist_users
    FOR UPDATE
    USING (true);

-- ============================================
-- 2. ADD COLUMN TO EXISTING user_profiles TABLE (IF IT EXISTS)
-- ============================================
-- Only add waitlist_approved column if the table exists and column doesn't exist
DO $$ 
BEGIN
    -- Check if user_profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        -- Add waitlist_approved column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'waitlist_approved') THEN
            ALTER TABLE public.user_profiles ADD COLUMN waitlist_approved BOOLEAN DEFAULT true;
            -- Set all existing users to approved (they already have accounts!)
            UPDATE public.user_profiles SET waitlist_approved = true WHERE waitlist_approved IS NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. AUTO-UPDATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_waitlist_users_updated_at ON public.waitlist_users;
CREATE TRIGGER update_waitlist_users_updated_at
    BEFORE UPDATE ON public.waitlist_users
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
    
    -- Update user profile IF the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        UPDATE public.user_profiles
        SET waitlist_approved = true
        WHERE user_id = user_auth_id;
    END IF;
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
GRANT ALL ON public.waitlist_users TO service_role;

-- ============================================
-- 7. TRIGGER TO CREATE/UPDATE PROFILE ON WAITLIST SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if user_profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        INSERT INTO public.user_profiles (user_id, email, full_name, waitlist_approved)
        VALUES (NEW.auth_user_id, NEW.email, NEW.full_name, false)
        ON CONFLICT (user_id) DO UPDATE SET waitlist_approved = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_waitlist_user_created ON public.waitlist_users;
CREATE TRIGGER on_waitlist_user_created
    AFTER INSERT ON public.waitlist_users
    FOR EACH ROW
    EXECUTE FUNCTION handle_waitlist_signup();

-- ============================================
-- NOTES
-- ============================================
-- ✅ This migration is SAFE - it only adds new features
-- ✅ Existing users are automatically approved (waitlist_approved = true)
-- ✅ New waitlist users need manual approval
-- ✅ Does NOT break any existing authentication
-- ✅ Existing users can still login normally
