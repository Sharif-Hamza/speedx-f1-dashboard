-- Fix RLS policies to allow anonymous submissions
-- Run this in Supabase SQL Editor

-- Drop existing policies that are blocking submissions
DROP POLICY IF EXISTS "Anyone can submit support requests" ON support_requests;
DROP POLICY IF EXISTS "Anyone can submit data requests" ON data_requests;

-- Create new policies that actually allow public inserts
CREATE POLICY "Public can insert support requests"
  ON support_requests 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can insert data requests"
  ON data_requests 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify the policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('support_requests', 'data_requests');
