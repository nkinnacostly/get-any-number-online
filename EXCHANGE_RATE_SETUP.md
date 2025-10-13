# Exchange Rate System Setup Guide

This guide will help you set up the USD to NGN exchange rate system with daily automatic updates.

## Overview

The exchange rate system:

- Fetches daily USD to NGN rates from ExchangeRate-API
- Stores rates in Supabase database
- Automatically updates service pricing with new rates
- Displays prices in Naira to users
- Runs daily updates at 12am Nigeria time (11pm UTC)

## Prerequisites

1. Supabase project with admin access
2. ExchangeRate-API account (https://www.exchangerate-api.com/)
3. Vercel account (for cron jobs) OR Supabase CLI (for edge function scheduling)

## Step 1: Database Setup

### Run the Migration

Execute the SQL migration to create the necessary tables:

```bash
# Option 1: Using Supabase Dashboard
# 1. Go to your Supabase Dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of:
#    supabase/migrations/20250113000001_create_exchange_rates_system.sql
# 4. Click "Run"

# Option 2: Using Supabase CLI
supabase db push
```

### Verify Tables

Check that the following tables were created:

- `exchange_rates` - Stores daily exchange rates
- `service_pricing` - Caches converted Naira prices
- `user_wallets` - Updated with `balance_ngn` column

## Step 2: Environment Variables

Add the following environment variables to your project:

### For Local Development (.env.local)

```env
# ExchangeRate-API Configuration
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here

# Supabase Configuration (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### For Production (Vercel)

Add the same variables to your Vercel project settings:

```bash
vercel env add EXCHANGERATE_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### For Supabase Edge Function

Add secrets to Supabase:

```bash
supabase secrets set EXCHANGERATE_API_KEY=your_api_key_here
```

## Step 3: Get ExchangeRate-API Key

1. Sign up at https://www.exchangerate-api.com/
2. Free tier includes 1000 requests/month (sufficient for daily updates)
3. Copy your API key
4. Add it to your environment variables

## Step 4: Deploy Edge Function

### Option A: Using Supabase CLI (Recommended)

```bash
# Deploy the edge function
supabase functions deploy update-exchange-rate

# Test the function manually
supabase functions invoke update-exchange-rate
```

### Option B: Using Supabase Dashboard

1. Go to Edge Functions in your Supabase Dashboard
2. Create new function: `update-exchange-rate`
3. Copy contents from `supabase/functions/update-exchange-rate/index.ts`
4. Deploy the function

## Step 5: Set Up Cron Job for Daily Updates

### Option A: Using Supabase Cron (Recommended for Edge Functions)

1. Go to Supabase Dashboard → Database → Extensions
2. Enable the `pg_cron` extension
3. Run this SQL in the SQL Editor:

```sql
-- Schedule daily rate update at 11pm UTC (12am Nigeria time)
SELECT cron.schedule(
  'daily-exchange-rate-update',
  '0 23 * * *',  -- Run at 11pm UTC every day
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-exchange-rate',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove the job (if needed)
-- SELECT cron.unschedule('daily-exchange-rate-update');
```

### Option B: Using Vercel Cron Jobs

1. Create an API route for cron: `/app/api/cron/update-exchange-rate/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call the API route to update exchange rate
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/exchange-rate/update`,
      { method: "POST" }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to update exchange rate" },
      { status: 500 }
    );
  }
}
```

2. Add cron configuration to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-exchange-rate",
      "schedule": "0 23 * * *"
    }
  ]
}
```

3. Add `CRON_SECRET` to your environment variables:

```bash
# Generate a secure random string
openssl rand -base64 32

# Add to Vercel
vercel env add CRON_SECRET
```

### Option C: Using GitHub Actions

Create `.github/workflows/update-exchange-rate.yml`:

```yaml
name: Update Exchange Rate

on:
  schedule:
    # Run at 11pm UTC every day (12am Nigeria time)
    - cron: "0 23 * * *"
  workflow_dispatch: # Allow manual trigger

jobs:
  update-rate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Update API
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.API_SECRET }}" \
            https://your-domain.com/api/exchange-rate/update
```

## Step 6: Initial Rate Setup

Manually trigger the first rate update:

### Using API Route

```bash
curl -X POST https://your-domain.com/api/exchange-rate/update
```

### Using Supabase Edge Function

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-exchange-rate
```

## Step 7: Add Exchange Rate Banner (Optional)

Add the exchange rate banner to your dashboard or main layout:

```tsx
// app/layout.tsx or app/dashboard/page.tsx
import { ExchangeRateBanner } from "@/components/exchange-rate/rate-banner";

export default function DashboardLayout() {
  return (
    <div>
      {/* Add the banner at the top */}
      <ExchangeRateBanner />

      {/* Rest of your content */}
    </div>
  );
}
```

## Step 8: Update Wallet Display (Optional)

If you want to display Naira balance in wallet:

```tsx
// components/wallet/wallet-card.tsx
import { useExchangeRate } from "@/hooks/useExchangeRate";

export function WalletCard({ balance }: { balance: number }) {
  const { convertUSDtoNGN, formatNGN } = useExchangeRate();

  const ngnBalance = convertUSDtoNGN(balance);

  return (
    <div>
      <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
      <p className="text-sm text-gray-500">{formatNGN(ngnBalance)}</p>
    </div>
  );
}
```

## Step 9: Testing

### Test Price Display

1. Navigate to the numbers purchase page
2. Verify prices are shown in Naira
3. Check that USD reference is displayed
4. Verify exchange rate banner displays correctly (if added)

### Test Initial Rate Update

```bash
# Trigger the first rate update
curl -X POST http://localhost:3000/api/exchange-rate/update

# Verify it was stored
curl http://localhost:3000/api/exchange-rate/current
```

### Test Cron Job

```bash
# For Supabase pg_cron, check logs
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-exchange-rate-update')
ORDER BY start_time DESC
LIMIT 10;

# For Vercel, check deployment logs
vercel logs --follow
```

## Monitoring and Maintenance

### Monitor API Usage

Check your ExchangeRate-API dashboard regularly:

- Free tier: 1000 requests/month
- Daily cron: 30 requests/month
- Plenty of room for manual updates and development

### Check Exchange Rate Freshness

The system marks rates as "stale" after 24 hours. Monitor for:

- Failed cron jobs
- API errors
- Network issues

### Manual Intervention

If automatic updates fail:

1. Check API key validity
2. Verify cron job is running
3. Check Supabase function logs
4. Check Vercel deployment logs
5. Manually trigger update via API endpoint if needed

## Troubleshooting

### Issue: "No active exchange rate found"

**Solution:**

```sql
-- Check if rates exist
SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT 5;

-- If empty, manually insert fallback rate
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_active)
VALUES ('USD', 'NGN', 1550.00, true);
```

### Issue: Cron job not running

**Solution:**

```sql
-- For pg_cron, check if extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check if job is scheduled
SELECT * FROM cron.job;

-- Check job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Issue: Prices not updating

**Solution:**

1. Check if `service_pricing` table has data
2. Verify exchange rate is active
3. Manually trigger price update via API

### Issue: ExchangeRate-API errors

**Solution:**

1. Verify API key is correct
2. Check API quota at https://www.exchangerate-api.com/dashboard
3. Ensure API is not rate-limited

## API Endpoints Reference

| Endpoint                       | Method   | Description                  |
| ------------------------------ | -------- | ---------------------------- |
| `/api/exchange-rate/current`   | GET      | Get current active rate      |
| `/api/exchange-rate/update`    | POST     | Manually trigger rate update |
| `/api/exchange-rate/history`   | GET      | Get rate history             |
| `/api/exchange-rate/calculate` | POST/GET | Calculate price conversions  |

## Database Functions Reference

| Function                             | Description                    |
| ------------------------------------ | ------------------------------ |
| `get_latest_exchange_rate()`         | Returns latest active rate     |
| `convert_usd_to_ngn(amount, markup)` | Convert USD to NGN with markup |
| `activate_exchange_rate(rate_id)`    | Activate specific rate         |

## Support

For issues or questions:

1. Check logs in Supabase Dashboard
2. Review API documentation: https://www.exchangerate-api.com/docs
3. Check Supabase Edge Function logs
4. Review cron job execution logs

## License

This exchange rate system is part of your SMS Pool application.
