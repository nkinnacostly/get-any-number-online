# Exchange Rate System - Quick Start Guide

Get your USD to NGN exchange rate system up and running in 5 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Get ExchangeRate-API Key (2 minutes)

1. Visit https://www.exchangerate-api.com/
2. Sign up for free (no credit card required)
3. Copy your API key
4. Free tier: 1000 requests/month (more than enough!)

### Step 2: Add Environment Variable (1 minute)

Add to your `.env.local` file:

```env
EXCHANGERATE_API_KEY=your_api_key_here
CRON_SECRET=$(openssl rand -base64 32)  # Run this to generate secret
```

Add to Vercel (if deployed):

```bash
vercel env add EXCHANGERATE_API_KEY
vercel env add CRON_SECRET
```

### Step 3: Run Database Migration (1 minute)

**Option A: Supabase Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `supabase/migrations/20250113000001_create_exchange_rates_system.sql`
3. Click "Run"

**Option B: Supabase CLI**

```bash
supabase db push
```

### Step 4: Initialize Exchange Rate (30 seconds)

Make a POST request to initialize the first rate:

```bash
# Local development
curl -X POST http://localhost:3000/api/exchange-rate/update

# Production
curl -X POST https://your-domain.com/api/exchange-rate/update
```

### Step 5: Verify Everything Works (30 seconds)

```bash
# Check current rate
curl http://localhost:3000/api/exchange-rate/current

# Should return something like:
# {
#   "success": true,
#   "rate": {
#     "baseCurrency": "USD",
#     "targetCurrency": "NGN",
#     "rate": 1550.00,
#     ...
#   }
# }
```

## ✅ You're Done!

The system is now:

- ✅ Fetching real-time USD to NGN rates
- ✅ Converting prices to Naira automatically
- ✅ Updating daily at 12am Nigeria time (via Vercel Cron)

## 📦 What You Get

### 1. Automatic Price Conversion

All USD prices are automatically converted to NGN with your 35% markup:

```tsx
import { PriceDisplay } from "@/components/pricing/price-display";

// Shows ₦2,092.50 (converted from $1 USD)
<PriceDisplay usdAmount={1.0} />;
```

### 2. Exchange Rate Banner

Shows current rate to users:

```tsx
import { ExchangeRateBanner } from "@/components/exchange-rate/rate-banner";

<ExchangeRateBanner />;
// Displays: USD to NGN: ₦1,550.00 | Updated 2h ago
```

### 3. Price Calculator Hook

Use in any component:

```tsx
import { useExchangeRate } from "@/hooks/useExchangeRate";

function MyComponent() {
  const { convertUSDtoNGN, formatNGN } = useExchangeRate();

  const nairaPrice = convertUSDtoNGN(10.0); // Converts $10 to NGN
  const formatted = formatNGN(nairaPrice); // "₦13,525.00"
}
```

## 🎨 Add to Your Pages

### Add Banner to Dashboard (Optional)

```tsx
// app/dashboard/page.tsx
import { ExchangeRateBanner } from "@/components/exchange-rate/rate-banner";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <ExchangeRateBanner />
      {/* Your dashboard content */}
    </div>
  );
}
```

### Update Purchase Flow (Already Done!)

The `order-confirmation.tsx` component is already updated to show Naira prices! 🎉

## 🔄 Automatic Updates

Your cron job (configured in `vercel.json`) runs automatically:

- **Schedule**: Daily at 11pm UTC (12am Nigeria time)
- **Action**: Fetches latest USD/NGN rate
- **Updates**: All cached service prices automatically

## 📊 Monitor Your System

### Check API Usage

Visit https://www.exchangerate-api.com/dashboard to monitor:

- Daily requests used
- Monthly quota (1000 requests)
- Current rate data

### View Rate History

```bash
curl http://localhost:3000/api/exchange-rate/history?limit=7
```

### Check Cron Job Logs

In Vercel Dashboard:

1. Go to your project
2. Click "Deployments"
3. View logs for cron executions

## 🐛 Troubleshooting

### Rate not showing?

```sql
-- Check if rates exist in database
SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT 1;

-- If empty, manually insert fallback
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_active)
VALUES ('USD', 'NGN', 1550.00, true);
```

### Prices still in USD?

1. Check browser console for errors
2. Verify exchange rate is active: `curl /api/exchange-rate/current`
3. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)

### Cron not running?

1. Check `vercel.json` is committed to git
2. Verify `CRON_SECRET` is set in Vercel
3. Check deployment logs for errors

## 📚 Full Documentation

For advanced configuration and detailed setup:

- See `EXCHANGE_RATE_SETUP.md` for complete documentation
- Check API endpoints in the setup guide
- Review database functions reference

## 🎉 Success Checklist

- [ ] ExchangeRate-API key obtained
- [ ] Environment variables configured
- [ ] Database migration run successfully
- [ ] Initial rate fetched (check via API)
- [ ] Prices showing in Naira on purchase page
- [ ] Cron job scheduled (check `vercel.json`)
- [ ] Exchange rate banner added (optional)

## 💡 Pro Tips

1. **Test Locally First**: Run manual update before deploying to production
2. **Monitor API Quota**: Check your ExchangeRate-API dashboard monthly
3. **Set Alerts**: Get notified if cron job fails (Vercel integrations)
4. **Cache Aggressively**: Rates update once daily, cache everywhere
5. **Show USD Reference**: Users trust seeing original USD price

## 🆘 Need Help?

1. Check logs: `vercel logs --follow`
2. Review full docs: `EXCHANGE_RATE_SETUP.md`
3. Test endpoints manually with curl
4. Check Supabase logs for database errors

---

**That's it!** Your exchange rate system is live and automatically updating daily. 🚀

Prices will now display in Naira throughout your application, making it easier for Nigerian users to understand costs without mental currency conversion!
