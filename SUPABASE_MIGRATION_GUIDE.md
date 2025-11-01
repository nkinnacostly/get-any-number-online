# Supabase Migration & Configuration Guide

## 🎯 Step-by-Step Instructions

This guide will help you:
1. Run the Flutterwave database migration
2. Add Flutterwave environment variables to Supabase
3. Verify everything is working

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Supabase account
- ✅ Access to your Supabase project dashboard
- ✅ Flutterwave API keys (test or live)

---

## 🗄️ Part 1: Run Database Migration

You have **3 options** to run the migration:

### Option A: Via Supabase CLI (Recommended)

```bash
# Step 1: Login to Supabase
supabase login

# Step 2: Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Step 3: Push the migration
supabase db push

# This will apply: 20250115000001_add_payment_gateway_support.sql
```

### Option B: Via Supabase Dashboard (Easy)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of this file:
   ```
   supabase/migrations/20250115000001_add_payment_gateway_support.sql
   ```
5. Paste into the SQL Editor
6. Click **Run** button
7. ✅ Migration complete!

### Option C: Via Direct SQL Connection

```bash
# Get your connection string from Supabase dashboard
# Settings → Database → Connection String

# Run migration directly
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/migrations/20250115000001_add_payment_gateway_support.sql
```

---

## 🔑 Part 2: Add Environment Variables to Supabase

### For Edge Functions (if using webhooks)

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** in sidebar
3. Click **Settings** (gear icon)
4. Add these secrets:

```bash
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key
FLUTTERWAVE_SECRET_HASH=your-webhook-secret-hash
```

### Via Supabase CLI

```bash
# Set secrets for edge functions
supabase secrets set FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-key
supabase secrets set FLUTTERWAVE_SECRET_HASH=your-hash
```

---

## 🌐 Part 3: Configure Frontend Environment Variables

### Create `.env.local` file

Create this file in your project root:

```bash
# /Users/nkinnacostly/Documents/mysms-pool/.env.local

# Flutterwave API Credentials
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Exchange Rate API (if not already set)
# Add your exchange rate API key if needed
```

### Get Flutterwave Keys

1. Go to https://dashboard.flutterwave.com/
2. Navigate to **Settings** → **API Keys**
3. Copy your **Test Public Key** and **Test Secret Key**
4. Go to **Settings** → **Webhooks**
5. Copy your **Secret Hash**

---

## ✅ Part 4: Verify Migration

### Check Database Changes

Run this query in Supabase SQL Editor:

```sql
-- Check if new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
  AND column_name IN (
    'payment_method',
    'gateway_transaction_id',
    'gateway_reference',
    'gateway_status',
    'gateway_metadata'
  );

-- Expected result: 5 rows showing the new columns
```

### Expected Output:

```
column_name              | data_type | is_nullable | column_default
-------------------------+-----------+-------------+----------------
payment_method           | text      | YES         | 'legacy'
gateway_transaction_id   | text      | YES         | NULL
gateway_reference        | text      | YES         | NULL
gateway_status           | text      | YES         | NULL
gateway_metadata         | jsonb     | YES         | '{}'::jsonb
```

### Verify Indexes

```sql
-- Check if indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'transactions'
  AND indexname LIKE '%gateway%';

-- Expected: 3 indexes
```

### Check Helper Function

```sql
-- Verify helper function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'get_transaction_by_gateway_id';

-- Should return 1 row
```

---

## 🧪 Part 5: Test the Integration

### Test Database Changes

```sql
-- Insert a test Flutterwave transaction
INSERT INTO transactions (
  user_id,
  type,
  amount,
  description,
  status,
  payment_method,
  gateway_transaction_id,
  gateway_status,
  gateway_metadata
) VALUES (
  'your-user-id-here',
  'deposit',
  10.00,
  'Test Flutterwave payment',
  'completed',
  'flutterwave',
  'FLW-TEST-123456',
  'successful',
  '{"amount_ngn": 16500, "currency": "NGN"}'::jsonb
);

-- Verify it was inserted
SELECT * FROM transactions
WHERE payment_method = 'flutterwave'
ORDER BY created_at DESC
LIMIT 1;
```

### Test Frontend

```bash
# Start your app
npm run dev

# Go to: http://localhost:3000/wallet
# Click "Fund Wallet"
# Select Flutterwave
# Enter amount: ₦1000
# Click button to test payment modal
```

---

## 🔒 Part 6: Configure Flutterwave Webhook

### Set Webhook URL

1. Go to https://dashboard.flutterwave.com/
2. Navigate to **Settings** → **Webhooks**
3. Set webhook URL to:
   ```
   https://your-domain.com/api/flutterwave/webhook
   ```
   
   For local testing (using ngrok):
   ```
   https://your-ngrok-url.ngrok.io/api/flutterwave/webhook
   ```

4. Copy the **Secret Hash** and add to environment variables

---

## 📊 Part 7: Verify Everything Works

### Checklist

- [ ] Migration applied successfully
- [ ] New columns visible in database
- [ ] Indexes created
- [ ] Helper function exists
- [ ] Frontend environment variables set
- [ ] Supabase secrets configured
- [ ] Webhook URL configured in Flutterwave
- [ ] Test payment modal opens
- [ ] Can see Flutterwave option in wallet

### Quick Verification Script

Run this in Supabase SQL Editor:

```sql
-- Comprehensive verification
DO $$
BEGIN
  -- Check payment_method column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions'
    AND column_name = 'payment_method'
  ) THEN
    RAISE NOTICE '✅ payment_method column exists';
  ELSE
    RAISE NOTICE '❌ payment_method column missing';
  END IF;

  -- Check gateway_transaction_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions'
    AND column_name = 'gateway_transaction_id'
  ) THEN
    RAISE NOTICE '✅ gateway_transaction_id column exists';
  ELSE
    RAISE NOTICE '❌ gateway_transaction_id column missing';
  END IF;

  -- Check helper function
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_transaction_by_gateway_id'
  ) THEN
    RAISE NOTICE '✅ Helper function exists';
  ELSE
    RAISE NOTICE '❌ Helper function missing';
  END IF;

  -- Check indexes
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'transactions'
    AND indexname = 'idx_transactions_gateway_transaction_id'
  ) THEN
    RAISE NOTICE '✅ Indexes created';
  ELSE
    RAISE NOTICE '❌ Indexes missing';
  END IF;

  RAISE NOTICE '✅ Verification complete!';
END $$;
```

---

## 🐛 Troubleshooting

### "Migration already applied"

This is normal if you've run the migration before. Check:

```sql
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '20250115000001';
```

If it exists, the migration is already applied. ✅

### "Column already exists"

The migration file has `IF NOT EXISTS` checks, so it's safe to run multiple times.

### Environment variables not working

1. Restart your development server: `npm run dev`
2. Check `.env.local` file exists and has correct values
3. Verify no extra spaces or quotes around values

### Webhook not receiving calls

1. Verify webhook URL is correct in Flutterwave dashboard
2. Check webhook secret hash matches
3. For local testing, use ngrok or similar tunneling service
4. Check Supabase Edge Function logs

---

## 📞 Need Help?

### Check These Resources:

1. **Migration File:** `supabase/migrations/20250115000001_add_payment_gateway_support.sql`
2. **Integration Guide:** `FLUTTERWAVE_INTEGRATION.md`
3. **Quick Start:** `FLUTTERWAVE_QUICKSTART.md`
4. **Inline Script Guide:** `FLUTTERWAVE_INLINE_SCRIPT.md`

### Common Issues:

- **Can't login to Supabase CLI:** Get access token from https://supabase.com/dashboard/account/tokens
- **Migration errors:** Check PostgreSQL version compatibility
- **Environment variables not loading:** Make sure `.env.local` is in project root

---

## ✅ Success Criteria

When everything is set up correctly:

1. ✅ Database has 5 new columns in `transactions` table
2. ✅ 3 new indexes exist
3. ✅ Helper function `get_transaction_by_gateway_id` exists
4. ✅ View `payment_gateway_stats` exists
5. ✅ Frontend loads without errors
6. ✅ Flutterwave modal opens when clicking "Fund Wallet"
7. ✅ Test payment can be initiated

---

## 🚀 You're All Set!

Once you've completed all steps:
1. Migration is applied ✅
2. Environment variables configured ✅
3. Webhook URL set up ✅
4. Ready to accept payments! 🎉

**Test with a small amount first before going live!**

