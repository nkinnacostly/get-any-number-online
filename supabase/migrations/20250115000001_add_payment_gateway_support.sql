-- Migration: Add Payment Gateway Support for Flutterwave and Future Integrations
-- Date: 2025-01-15
-- Description: Extends transactions table to support multiple payment gateways
-- while maintaining full backward compatibility with existing Cryptomus and Paystack data

-- Add payment_method column to track which gateway was used
-- Default to 'legacy' for existing records to maintain compatibility
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'legacy';

-- Add comment explaining payment methods
COMMENT ON COLUMN public.transactions.payment_method IS 
'Payment gateway used: legacy (existing records), paystack, cryptomus, flutterwave';

-- Add gateway-specific transaction reference columns
-- These are optional and only used when applicable
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_reference TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_status TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_metadata JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.transactions.gateway_transaction_id IS 
'Unique transaction ID from the payment gateway (e.g., Flutterwave tx_ref)';

COMMENT ON COLUMN public.transactions.gateway_reference IS 
'Secondary reference from gateway (e.g., Flutterwave transaction ID)';

COMMENT ON COLUMN public.transactions.gateway_status IS 
'Raw status from payment gateway for debugging and reconciliation';

COMMENT ON COLUMN public.transactions.gateway_metadata IS 
'Additional gateway-specific data stored as JSON (e.g., customer info, card details, etc.)';

-- Create index for faster gateway transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_transaction_id 
ON public.transactions(gateway_transaction_id) 
WHERE gateway_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_payment_method 
ON public.transactions(payment_method);

-- Create index on gateway_reference for quick verification queries
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_reference 
ON public.transactions(gateway_reference) 
WHERE gateway_reference IS NOT NULL;

-- Update existing Paystack transactions (if identifiable by description pattern)
UPDATE public.transactions 
SET payment_method = 'paystack' 
WHERE payment_method = 'legacy' 
  AND description LIKE '%Paystack%'
  AND type = 'deposit';

-- Update existing Cryptomus transactions (if identifiable by description pattern or reference_id)
UPDATE public.transactions 
SET payment_method = 'cryptomus' 
WHERE payment_method = 'legacy' 
  AND (description LIKE '%Cryptomus%' OR description LIKE '%UUID:%')
  AND type = 'deposit';

-- For Cryptomus transactions, extract UUID from description and store in gateway_transaction_id
UPDATE public.transactions 
SET gateway_transaction_id = 
  CASE 
    WHEN description ~ 'UUID: [a-f0-9-]+' THEN
      substring(description from 'UUID: ([a-f0-9-]+)')
    ELSE NULL
  END,
  gateway_reference = reference_id
WHERE payment_method = 'cryptomus' 
  AND gateway_transaction_id IS NULL;

-- Add check constraint to ensure valid payment methods
ALTER TABLE public.transactions 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('legacy', 'paystack', 'cryptomus', 'flutterwave', 'manual'));

-- Create helper function to get transaction by gateway ID
CREATE OR REPLACE FUNCTION public.get_transaction_by_gateway_id(
  p_gateway_transaction_id TEXT,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  amount DECIMAL(10,2),
  status TEXT,
  payment_method TEXT,
  gateway_transaction_id TEXT,
  gateway_reference TEXT,
  gateway_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_payment_method IS NULL THEN
    RETURN QUERY
    SELECT 
      t.id,
      t.user_id,
      t.type,
      t.amount,
      t.status,
      t.payment_method,
      t.gateway_transaction_id,
      t.gateway_reference,
      t.gateway_status,
      t.created_at
    FROM public.transactions t
    WHERE t.gateway_transaction_id = p_gateway_transaction_id
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT 
      t.id,
      t.user_id,
      t.type,
      t.amount,
      t.status,
      t.payment_method,
      t.gateway_transaction_id,
      t.gateway_reference,
      t.gateway_status,
      t.created_at
    FROM public.transactions t
    WHERE t.gateway_transaction_id = p_gateway_transaction_id
      AND t.payment_method = p_payment_method
    LIMIT 1;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_transaction_by_gateway_id IS 
'Helper function to quickly find a transaction by its gateway transaction ID';

-- Create view for payment gateway statistics (useful for admin dashboard)
CREATE OR REPLACE VIEW public.payment_gateway_stats AS
SELECT 
  payment_method,
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
  COALESCE(SUM(CASE WHEN status = 'completed' AND amount > 0 THEN amount ELSE 0 END), 0) as total_deposits,
  COALESCE(SUM(CASE WHEN status = 'completed' AND amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_withdrawals,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM public.transactions
WHERE type = 'deposit' OR type = 'withdrawal'
GROUP BY payment_method;

COMMENT ON VIEW public.payment_gateway_stats IS 
'Aggregated statistics for each payment gateway for monitoring and analytics';

-- Grant necessary permissions (adjust based on your RLS setup)
-- Service role can access everything
GRANT ALL ON public.transactions TO service_role;
GRANT EXECUTE ON FUNCTION public.get_transaction_by_gateway_id TO service_role;
GRANT SELECT ON public.payment_gateway_stats TO service_role;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Payment gateway support added successfully';
  RAISE NOTICE 'Backward compatibility: All existing transactions preserved';
  RAISE NOTICE 'New payment methods supported: paystack, cryptomus, flutterwave, manual';
END $$;

