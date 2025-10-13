# Deploy Exchange Rate System to Supabase

Follow these steps to deploy everything to Supabase.

## Step 1: Deploy Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy the entire contents from: `supabase/migrations/20250113000001_create_exchange_rates_system.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: ✅ Success. No rows returned

### Option B: Using Supabase CLI

```bash
# First, link your project (one-time setup)
supabase link --project-ref YOUR_PROJECT_REF

# Then push the migration
supabase db push
```

To find your PROJECT_REF:

- Go to Supabase Dashboard → Project Settings → General
- Copy the "Reference ID"

---

## Step 2: Deploy Edge Function

### Option A: Using Supabase Dashboard

1. In your Supabase Dashboard, go to **Edge Functions**
2. Click **Deploy new function**
3. Name it: `update-exchange-rate`
4. Copy the contents from: `supabase/functions/update-exchange-rate/index.ts`
5. Paste into the function editor
6. Click **Deploy function**

### Option B: Using Supabase CLI

```bash
# Deploy the edge function
supabase functions deploy update-exchange-rate

# You may need to login first
supabase login
```

---

## Step 3: Set Environment Variables in Supabase

### For Edge Function

1. Go to **Edge Functions** in Supabase Dashboard
2. Click on `update-exchange-rate` function
3. Go to **Settings** tab
4. Add these secrets:

```bash
EXCHANGERATE_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Using CLI (Alternative)

```bash
# Set the secrets
supabase secrets set EXCHANGERATE_API_KEY=your_api_key_here
```

To get your Supabase credentials:

- **SUPABASE_URL**: Dashboard → Project Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Dashboard → Project Settings → API → service_role key (⚠️ Keep secret!)

---

## Step 4: Set Up Cron Job (Optional - for daily updates)

### Option A: Using Supabase pg_cron Extension

1. Go to **Database** → **Extensions**
2. Enable `pg_cron` extension
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Schedule daily rate update at 11pm UTC (12am Nigeria time)
SELECT cron.schedule(
  'daily-exchange-rate-update',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-exchange-rate',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key')
    )
  ) AS request_id;
  $$
);
```

Replace `YOUR_PROJECT_REF` with your actual project reference.

### Option B: Deploy to Vercel (for Vercel Cron)

If you're deploying your Next.js app to Vercel, the cron job in `vercel.json` will automatically run. Just make sure to:

1. Set `EXCHANGERATE_API_KEY` in Vercel environment variables
2. Set `CRON_SECRET` in Vercel (generate with: `openssl rand -base64 32`)

---

## Step 5: Fetch Initial Exchange Rate

After everything is deployed, fetch the first rate:

### Using the API Route

```bash
# If running locally
curl -X POST http://localhost:3000/api/exchange-rate/update

# Or in production
curl -X POST https://your-domain.com/api/exchange-rate/update
```

### Using the Edge Function

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-exchange-rate
```

---

## Step 6: Verify Everything Works

### Check Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('exchange_rates', 'service_pricing');

-- Check if rate was inserted
SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT 1;
```

### Test the API

```bash
# Check current rate
curl http://localhost:3000/api/exchange-rate/current

# Should return something like:
# {
#   "success": true,
#   "rate": {
#     "rate": 1550.00,
#     "baseCurrency": "USD",
#     "targetCurrency": "NGN",
#     ...
#   }
# }
```

---

## Quick Deployment Checklist

- [ ] Database migration deployed (tables created)
- [ ] Edge function deployed
- [ ] Environment variables set in Supabase
- [ ] ExchangeRate-API key configured
- [ ] Cron job scheduled (optional)
- [ ] Initial rate fetched
- [ ] Verified rate displays in app

---

## Troubleshooting

### "Could not find the table 'public.exchange_rates'"

**Solution**: Database migration hasn't been run. Go back to Step 1.

### "EXCHANGERATE_API_KEY not configured"

**Solution**: Set the environment variable in Supabase Edge Functions settings (Step 3).

### Prices still showing in USD

**Solution**:

1. Make sure initial rate was fetched (Step 5)
2. Hard refresh your browser (Cmd/Ctrl + Shift + R)
3. Check browser console for errors

### Edge Function not working

**Solution**:

1. Check function logs in Supabase Dashboard → Edge Functions → Logs
2. Verify environment variables are set correctly
3. Test function manually from dashboard

---

## Need Help?

If you get stuck:

1. Check Supabase Dashboard → Logs for errors
2. Review the full setup guide: `EXCHANGE_RATE_SETUP.md`
3. Check the quick start: `EXCHANGE_RATE_QUICKSTART.md`

---

## What Gets Deployed

### Database (Supabase)

- ✅ `exchange_rates` table
- ✅ `service_pricing` table
- ✅ Database functions
- ✅ RLS policies
- ✅ Initial fallback rate

### Edge Function (Supabase)

- ✅ `update-exchange-rate` function
- ✅ Fetches daily USD/NGN rates
- ✅ Updates service pricing cache

### Next.js App (Vercel - if using)

- ✅ API routes
- ✅ React components
- ✅ Cron job configuration

---

**Ready to deploy!** Start with Step 1 above. 🚀
