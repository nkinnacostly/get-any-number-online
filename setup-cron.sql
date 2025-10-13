-- ============================================================================
-- SQL Script to set up daily cron job for exchange rate updates
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- STEP 1: Enable required extensions
-- ============================================================================

-- Enable pg_cron extension for scheduling jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- ============================================================================
-- STEP 2: Schedule the daily cron job
-- ============================================================================

-- Schedule daily rate update at 11pm UTC (12am Nigeria time)
-- This calls the edge function every day at midnight Nigeria time
SELECT cron.schedule(
  'daily-exchange-rate-update',           -- Job name
  '0 23 * * *',                          -- Cron schedule: 11pm UTC daily
  $$
  SELECT
    extensions.http_post(
      url := 'https://vjzsjwwqkykwoxpildqp.supabase.co/functions/v1/update-exchange-rate',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTYxMjIsImV4cCI6MjA3MzY5MjEyMn0.zMGRwB5uZ6__DOZZMFZ3YW1ULOPo6OvG_jBlySm8kLY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================================================
-- STEP 3: Verify the cron job was created
-- ============================================================================

SELECT 
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job 
WHERE jobname = 'daily-exchange-rate-update';

-- You should see 1 row with your cron job details

-- ============================================================================
-- USEFUL COMMANDS FOR MONITORING
-- ============================================================================

-- View recent cron job execution history (run this after 11pm UTC to see results)
-- SELECT 
--   jobid,
--   runid,
--   job_pid,
--   database,
--   username,
--   command,
--   status,
--   return_message,
--   start_time,
--   end_time
-- FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-exchange-rate-update')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- ============================================================================
-- MANUAL TESTING
-- ============================================================================

-- To manually trigger the function RIGHT NOW (for testing):
-- SELECT
--   extensions.http_post(
--     url := 'https://vjzsjwwqkykwoxpildqp.supabase.co/functions/v1/update-exchange-rate',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTYxMjIsImV4cCI6MjA3MzY5MjEyMn0.zMGRwB5uZ6__DOZZMFZ3YW1ULOPo6OvG_jBlySm8kLY"}'::jsonb,
--     body := '{}'::jsonb
--   );

-- ============================================================================
-- MAINTENANCE COMMANDS
-- ============================================================================

-- To temporarily disable the cron job:
-- UPDATE cron.job SET active = false WHERE jobname = 'daily-exchange-rate-update';

-- To re-enable the cron job:
-- UPDATE cron.job SET active = true WHERE jobname = 'daily-exchange-rate-update';

-- To completely remove the cron job (if you want to delete it):
-- SELECT cron.unschedule('daily-exchange-rate-update');

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- ✅ Your cron job is now set up!
-- ✅ Exchange rates will update automatically every day at 12am Nigeria time
-- ✅ No manual intervention needed
--
-- To verify it's working:
-- 1. Wait until after 11pm UTC (12am Nigeria time)
-- 2. Run the job history query above to see execution logs
-- 3. Check your app - prices should be in Naira
-- ============================================================================
