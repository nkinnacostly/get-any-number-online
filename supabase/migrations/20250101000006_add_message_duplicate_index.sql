-- Add index for efficient duplicate message detection
-- This index will speed up the query that checks for existing messages
-- with the same number_id, message_text, and sender

CREATE INDEX IF NOT EXISTS idx_received_messages_duplicate_check 
ON public.received_messages (number_id, message_text, sender);
