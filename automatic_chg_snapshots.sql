-- ============================================================================
-- AUTOMATIC WEEKLY LEADERBOARD SNAPSHOTS (EST TIMEZONE)
-- ============================================================================
-- This script creates an automatic system for capturing weekly leaderboard
-- snapshots every Sunday at midnight EST. This enables CHG (change) indicators
-- to work automatically without manual admin intervention.
--
-- IMPORTANT: This uses EST (UTC-5) year-round for consistency.
--
-- SETUP INSTRUCTIONS:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Enable pg_cron extension (Supabase does this automatically)
-- 3. The snapshots will be created every Sunday at 05:05 AM UTC (12:05 AM EST)
-- ============================================================================

-- Function to automatically create weekly snapshots
CREATE OR REPLACE FUNCTION auto_create_weekly_snapshots()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_sunday DATE;
    v_last_saturday DATE;
    v_max_speed_count BIGINT;
    v_distance_count BIGINT;
    v_result TEXT;
    v_est_now TIMESTAMPTZ;
    v_est_dow INTEGER;
BEGIN
    -- Calculate current time in EST (UTC-5)
    v_est_now := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '5 hours';
    v_est_dow := EXTRACT(DOW FROM v_est_now);
    
    -- Only run if today is Sunday in EST (day 0)
    IF v_est_dow <> 0 THEN
        RETURN 'Skipped: Not Sunday in EST (current day: ' || v_est_dow || ')';
    END IF;
    
    -- Calculate last week's dates in EST (Sunday to Saturday)
    v_last_saturday := ((v_est_now - INTERVAL '1 day') AT TIME ZONE 'UTC')::DATE; -- Yesterday (Saturday)
    v_last_sunday := (v_last_saturday - INTERVAL '6 days')::DATE; -- 6 days before Saturday
    
    -- Log the attempt
    RAISE NOTICE 'Creating automatic snapshots for week: % to %', v_last_sunday, v_last_saturday;
    
    -- Create Max Speed snapshot
    SELECT snapshots_saved INTO v_max_speed_count
    FROM save_weekly_snapshot(
        v_last_sunday,
        v_last_saturday,
        'max_speed'
    );
    
    RAISE NOTICE 'Max Speed snapshot: % entries saved', v_max_speed_count;
    
    -- Create Distance snapshot
    SELECT snapshots_saved INTO v_distance_count
    FROM save_weekly_snapshot(
        v_last_sunday,
        v_last_saturday,
        'distance'
    );
    
    RAISE NOTICE 'Distance snapshot: % entries saved', v_distance_count;
    
    -- Create result message
    v_result := 'SUCCESS: Snapshots created for ' || v_last_sunday || ' to ' || v_last_saturday || 
                '. Max Speed: ' || v_max_speed_count || ' entries, Distance: ' || v_distance_count || ' entries';
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in auto_create_weekly_snapshots: %', SQLERRM;
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auto_create_weekly_snapshots TO authenticated, service_role;

-- ============================================================================
-- OPTION 1: Using pg_cron (Supabase Platform tier or self-hosted)
-- ============================================================================
-- Uncomment the following lines if you have pg_cron enabled:

/*
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule automatic snapshot creation every Sunday at 12:05 AM EST (05:05 UTC)
-- EST = UTC-5, so 12:05 AM EST = 5:05 AM UTC
SELECT cron.schedule(
    'weekly-leaderboard-snapshot',
    '5 5 * * 0', -- Every Sunday at 05:05 AM UTC (12:05 AM EST)
    $$SELECT auto_create_weekly_snapshots()$$
);

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('weekly-leaderboard-snapshot');
*/

-- ============================================================================
-- OPTION 2: Using Supabase Edge Functions (Recommended for hosted Supabase)
-- ============================================================================
-- If pg_cron is not available, create a Supabase Edge Function that calls
-- this SQL function via HTTP request. Then use a service like GitHub Actions
-- or Vercel Cron to trigger it weekly.
--
-- Edge Function pseudocode:
-- ```typescript
-- import { createClient } from '@supabase/supabase-js'
-- 
-- Deno.serve(async (req) => {
--   const supabase = createClient(...)
--   const { data, error } = await supabase.rpc('auto_create_weekly_snapshots')
--   return new Response(JSON.stringify({ result: data }))
-- })
-- ```

-- ============================================================================
-- OPTION 3: Manual Trigger (Fallback)
-- ============================================================================
-- You can still manually trigger snapshot creation by running:
-- SELECT auto_create_weekly_snapshots();

-- ============================================================================
-- TESTING & VERIFICATION
-- ============================================================================

-- Test the automatic snapshot function (will only run on Sundays)
-- SELECT auto_create_weekly_snapshots();

-- Force create a snapshot for testing (any day)
-- SELECT save_weekly_snapshot(
--     (CURRENT_DATE - INTERVAL '7 days')::DATE,  -- Last Sunday
--     (CURRENT_DATE - INTERVAL '1 day')::DATE,    -- Last Saturday
--     'max_speed'
-- );

-- Check if snapshots exist for current and last week
SELECT 
    week_start,
    leaderboard_type,
    COUNT(*) as users,
    MIN(value) as min_value,
    MAX(value) as max_value
FROM weekly_leaderboard_snapshots
WHERE week_start >= (CURRENT_DATE - INTERVAL '14 days')::DATE
GROUP BY week_start, leaderboard_type
ORDER BY week_start DESC, leaderboard_type;

-- View all scheduled cron jobs (if using pg_cron)
-- SELECT * FROM cron.job;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to delete old snapshots (keep last 8 weeks only)
CREATE OR REPLACE FUNCTION cleanup_old_snapshots()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cutoff_date DATE;
    v_deleted_count BIGINT;
BEGIN
    -- Calculate cutoff date (8 weeks ago)
    v_cutoff_date := (CURRENT_DATE - INTERVAL '56 days')::DATE;
    
    -- Delete old snapshots
    DELETE FROM weekly_leaderboard_snapshots
    WHERE week_start < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN 'Deleted ' || v_deleted_count || ' snapshot entries older than ' || v_cutoff_date;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_old_snapshots TO authenticated, service_role;

-- Schedule cleanup monthly (first Sunday of each month at 01:00 AM)
-- SELECT cron.schedule(
--     'monthly-snapshot-cleanup',
--     '0 1 1-7 * 0', -- First Sunday of month at 1 AM
--     $$SELECT cleanup_old_snapshots()$$
-- );

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION auto_create_weekly_snapshots IS 
'Automatically creates weekly leaderboard snapshots every Sunday. Should be scheduled via pg_cron or triggered by Edge Function.';

COMMENT ON FUNCTION cleanup_old_snapshots IS 
'Removes snapshot entries older than 8 weeks to keep database clean.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Automatic CHG snapshot system installed successfully!';
    RAISE NOTICE '📅 Snapshots will be created every Sunday at 12:05 AM EST (05:05 UTC)';
    RAISE NOTICE '🌍 System uses EST (UTC-5) timezone consistently';
    RAISE NOTICE '🔄 CHG indicators now work automatically with fallback calculation';
    RAISE NOTICE '🧹 Old snapshots (>8 weeks) can be cleaned up with: SELECT cleanup_old_snapshots()';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. If using pg_cron: Uncomment the cron.schedule section above';
    RAISE NOTICE '2. If using Edge Functions: Create a weekly cron trigger at 12:05 AM EST';
    RAISE NOTICE '3. Verify with: SELECT * FROM cron.job; (if pg_cron enabled)';
    RAISE NOTICE '4. Test manually: SELECT auto_create_weekly_snapshots();';
END $$;
