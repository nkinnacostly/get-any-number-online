-- Migration: Create Exchange Rates System
-- Description: Creates tables for USD to NGN exchange rates and service pricing with daily updates

-- Exchange rates table to store daily USD/NGN rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  target_currency VARCHAR(3) DEFAULT 'NGN' NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50) DEFAULT 'exchangerate-api',
  CONSTRAINT valid_rate CHECK (rate > 0)
);

-- Index for faster lookups of active rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON exchange_rates(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);

-- Services pricing table to cache converted Naira prices
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL UNIQUE,
  original_usd_price DECIMAL(10,2) NOT NULL,
  markup_percentage DECIMAL(5,2) DEFAULT 35.00,
  final_ngn_price DECIMAL(10,2) NOT NULL,
  exchange_rate_used DECIMAL(10,2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_original_price CHECK (original_usd_price >= 0),
  CONSTRAINT valid_markup CHECK (markup_percentage >= 0),
  CONSTRAINT valid_final_price CHECK (final_ngn_price >= 0)
);

-- Index for faster service lookups
CREATE INDEX IF NOT EXISTS idx_service_pricing_name ON service_pricing(service_name);
CREATE INDEX IF NOT EXISTS idx_service_pricing_updated ON service_pricing(updated_at DESC);

-- Update user_wallets table to include Naira balance if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_wallets') THEN
    ALTER TABLE user_wallets 
    ADD COLUMN IF NOT EXISTS balance_ngn DECIMAL(10,2) DEFAULT 0.00;
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_rates
DROP POLICY IF EXISTS "Allow public read access to active exchange rates" ON exchange_rates;
CREATE POLICY "Allow public read access to active exchange rates" 
ON exchange_rates
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to insert exchange rates" ON exchange_rates;
CREATE POLICY "Allow authenticated users to insert exchange rates"
ON exchange_rates
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update exchange rates" ON exchange_rates;
CREATE POLICY "Allow authenticated users to update exchange rates"
ON exchange_rates
FOR UPDATE
USING (auth.role() = 'authenticated');

-- RLS Policies for service_pricing
DROP POLICY IF EXISTS "Allow public read access to service pricing" ON service_pricing;
CREATE POLICY "Allow public read access to service pricing" 
ON service_pricing
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert service pricing" ON service_pricing;
CREATE POLICY "Allow authenticated users to insert service pricing"
ON service_pricing
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update service pricing" ON service_pricing;
CREATE POLICY "Allow authenticated users to update service pricing"
ON service_pricing
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Function to get the latest active exchange rate
CREATE OR REPLACE FUNCTION get_latest_exchange_rate(
  p_base_currency VARCHAR DEFAULT 'USD',
  p_target_currency VARCHAR DEFAULT 'NGN'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_rate DECIMAL(10,2);
BEGIN
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE base_currency = p_base_currency
    AND target_currency = p_target_currency
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_rate, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to convert USD to NGN with markup
CREATE OR REPLACE FUNCTION convert_usd_to_ngn(
  p_usd_amount DECIMAL,
  p_markup_percentage DECIMAL DEFAULT 35.00
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_rate DECIMAL(10,2);
  v_amount_with_markup DECIMAL(10,2);
BEGIN
  -- Get latest exchange rate
  v_rate := get_latest_exchange_rate('USD', 'NGN');
  
  IF v_rate = 0 THEN
    RAISE EXCEPTION 'No active exchange rate found';
  END IF;
  
  -- Apply markup and convert
  v_amount_with_markup := p_usd_amount * (1 + (p_markup_percentage / 100));
  
  RETURN ROUND(v_amount_with_markup * v_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate old exchange rates and activate new one
CREATE OR REPLACE FUNCTION activate_exchange_rate(p_rate_id UUID)
RETURNS VOID AS $$
DECLARE
  v_base_currency VARCHAR(3);
  v_target_currency VARCHAR(3);
BEGIN
  -- Get currency pair from the new rate
  SELECT base_currency, target_currency INTO v_base_currency, v_target_currency
  FROM exchange_rates
  WHERE id = p_rate_id;
  
  -- Deactivate all existing rates for this currency pair
  UPDATE exchange_rates
  SET is_active = false
  WHERE base_currency = v_base_currency
    AND target_currency = v_target_currency
    AND id != p_rate_id;
  
  -- Activate the new rate
  UPDATE exchange_rates
  SET is_active = true
  WHERE id = p_rate_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial exchange rate if none exists (fallback rate)
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_active, source)
SELECT 'USD', 'NGN', 1550.00, true, 'initial_fallback'
WHERE NOT EXISTS (
  SELECT 1 FROM exchange_rates WHERE base_currency = 'USD' AND target_currency = 'NGN'
);

COMMENT ON TABLE exchange_rates IS 'Stores daily USD to NGN exchange rates from ExchangeRate-API';
COMMENT ON TABLE service_pricing IS 'Caches converted Naira prices for SMSPool services';
COMMENT ON FUNCTION get_latest_exchange_rate IS 'Returns the latest active exchange rate for a currency pair';
COMMENT ON FUNCTION convert_usd_to_ngn IS 'Converts USD amount to NGN with markup percentage';
COMMENT ON FUNCTION activate_exchange_rate IS 'Activates a specific exchange rate and deactivates others for the same currency pair';

