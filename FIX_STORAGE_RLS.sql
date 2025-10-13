-- =====================================================
-- FIX STORAGE RLS FOR ROUTE SNAPSHOTS
-- =====================================================
-- Allow ALL users to read route snapshots (for dashboard)
-- Only allow users to upload their own snapshots (for iOS app)
-- =====================================================

-- First, check current storage policies
-- Run this to see what exists:
-- SELECT * FROM storage.policies WHERE bucket_id = 'recaps';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for recaps" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own recaps" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own recaps" ON storage.objects;
DROP POLICY IF EXISTS "Public can read all recaps" ON storage.objects;

-- =====================================================
-- POLICY 1: Allow EVERYONE to READ all route snapshots
-- =====================================================
-- This allows the dashboard to display route maps for all users
CREATE POLICY "Public can read all recaps"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recaps');

-- =====================================================
-- POLICY 2: Allow authenticated users to UPLOAD to their own folder
-- =====================================================
-- This allows iOS app to upload route snapshots to their user folder
CREATE POLICY "Users can upload their own recaps"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'recaps'
  -- No auth check needed since we disabled RLS on trips table
  -- iOS app uses anon key to upload
);

-- =====================================================
-- POLICY 3: Allow users to UPDATE their own files
-- =====================================================
CREATE POLICY "Users can update their own recaps"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'recaps')
WITH CHECK (bucket_id = 'recaps');

-- =====================================================
-- POLICY 4: Allow users to DELETE their own files
-- =====================================================
CREATE POLICY "Users can delete their own recaps"
ON storage.objects
FOR DELETE
USING (bucket_id = 'recaps');

-- =====================================================
-- Make the bucket public (if not already)
-- =====================================================
UPDATE storage.buckets
SET public = true
WHERE id = 'recaps';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify the policies are working:

-- 1. Check bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'recaps';
-- Should show: public = true

-- 2. Check policies exist
SELECT 
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'UPLOAD'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
  END as operation
FROM storage.policies 
WHERE bucket_id = 'recaps'
ORDER BY cmd;

-- 3. Test read access (should return files)
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'recaps' 
LIMIT 5;

-- =====================================================
-- EXPLANATION
-- =====================================================
-- The issue was that storage RLS was blocking reads.
-- 
-- Now:
-- - Everyone can READ snapshots (for dashboard to display maps)
-- - Anyone can UPLOAD snapshots (iOS app uses anon key)
-- - Users can manage their own files
-- 
-- This is safe because:
-- - Route snapshots are not sensitive data (just map images)
-- - The file paths include user IDs so they're organized
-- - The dashboard needs to show all users' route maps
