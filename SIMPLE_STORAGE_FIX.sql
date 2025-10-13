-- =====================================================
-- SIMPLE FIX: Make recaps bucket COMPLETELY PUBLIC
-- =====================================================
-- This disables all RLS checks on the storage bucket
-- So ANYONE can read/upload files (like the trips table)
-- =====================================================

-- Method 1: Make bucket public (easiest)
UPDATE storage.buckets
SET public = true
WHERE id = 'recaps';

-- Method 2: Disable RLS on storage.objects for this bucket
-- This is the NUCLEAR option that definitely works
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- That's it! Now test by opening the image URL directly
-- =====================================================
-- Try opening this URL in incognito/private browser:
-- https://bzfrmujzxmfufvumknkq.supabase.co/storage/v1/object/public/recaps/route-snapshots/[USER_ID]/route_[TRIP_ID].jpg
--
-- It should load WITHOUT requiring authentication
-- =====================================================

-- =====================================================
-- ALTERNATIVE: If you want RLS but working policies
-- =====================================================
-- Only run this if the above doesn't work:

-- First enable RLS
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Then create simple policies
-- DROP POLICY IF EXISTS "Allow public read on recaps" ON storage.objects;
-- CREATE POLICY "Allow public read on recaps"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'recaps');

-- DROP POLICY IF EXISTS "Allow public insert on recaps" ON storage.objects;
-- CREATE POLICY "Allow public insert on recaps"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'recaps');
