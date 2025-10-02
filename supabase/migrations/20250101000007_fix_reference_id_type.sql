-- Fix reference_id column type to support external transaction IDs
-- Change from UUID to TEXT to accommodate various external payment system IDs

ALTER TABLE public.transactions 
ALTER COLUMN reference_id TYPE TEXT;
