-- Fix RLS policy for received_messages to allow service role inserts
-- This allows edge functions to insert messages into the database

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can insert messages" ON public.received_messages;

-- Create policy to allow service role to insert messages
CREATE POLICY "Service role can insert messages" ON public.received_messages
  FOR INSERT WITH CHECK (true);
