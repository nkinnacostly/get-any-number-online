# Flutterwave Integration - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Get Flutterwave Account (2 minutes)

1. Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Test** keys:
   - Public Key: `FLPUBK_TEST-...`
   - Secret Key: `FLWSECK_TEST-...`

### Step 2: Configure Environment (1 minute)

```bash
# Copy example file
cp .env.flutterwave.example .env.local

# Edit .env.local and add your keys:
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-your-key-here
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-here
FLUTTERWAVE_SECRET_HASH=your-webhook-hash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Database Migration (1 minute)

```bash
# If using Supabase
supabase migration up

# Or manually
psql -d your_database -f supabase/migrations/20250115000001_add_payment_gateway_support.sql
```

### Step 4: Start Your App (30 seconds)

```bash
npm run dev
```

### Step 5: Test Payment (30 seconds)

1. Navigate to: http://localhost:3000/wallet
2. Click **"Add Funds"**
3. Enter amount: **₦1000**
4. Click **"Fund Wallet"**
5. Use test card:
   ```
   Card: 5531886652142950
   CVV: 564
   Expiry: 09/32
   PIN: 3310
   OTP: 12345
   ```

✅ **Done!** Your wallet should be funded instantly.

---

## 📝 What Was Added?

### Files Created:
- ✅ `services/flutterwave-api.ts` - API service
- ✅ `app/api/flutterwave/initiate-payment/route.ts` - Start payment
- ✅ `app/api/flutterwave/verify-payment/route.ts` - Verify payment
- ✅ `app/api/flutterwave/webhook/route.ts` - Webhook handler
- ✅ `components/wallet/flutterwave-funding.tsx` - UI component
- ✅ `supabase/migrations/20250115000001_add_payment_gateway_support.sql` - DB schema

### Files Modified:
- ✅ `components/wallet/wallet-card.tsx` - Added Flutterwave option

### Existing Functionality:
- ✅ **Cryptomus** - Still works perfectly
- ✅ **Paystack** - Still works perfectly
- ✅ **All transactions** - Preserved

---

## 🎯 Features

### Payment Methods:
- 💳 **Cards** (Visa, Mastercard, Verve)
- 🏦 **Bank Transfer**
- 📱 **USSD**

### Technical Features:
- ✅ Automatic NGN → USD conversion
- ✅ Real-time verification
- ✅ Webhook backup
- ✅ Duplicate prevention
- ✅ Comprehensive error handling

---

## 🐛 Troubleshooting

### Payment not working?

1. **Check environment variables:**
   ```bash
   cat .env.local | grep FLUTTERWAVE
   ```

2. **Check database migration:**
   ```bash
   psql -d your_db -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method';"
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab

4. **Check server logs:**
   - Terminal where `npm run dev` is running
   - Look for Flutterwave API errors

### Common Errors:

**"Invalid API credentials"**
- Solution: Check your API keys in `.env.local`
- Make sure they start with `FLPUBK_TEST-` and `FLWSECK_TEST-`

**"Minimum amount error"**
- Solution: Amount must be at least ₦100

**"User not found"**
- Solution: Make sure you're logged in

---

## 📚 Next Steps

### For Development:
1. ✅ Test successful payments
2. ✅ Test failed payments
3. ✅ Test webhook delivery
4. ✅ Verify existing Paystack/Cryptomus still work

### For Production:
1. Complete Flutterwave KYC verification
2. Get Live API keys
3. Update environment variables
4. Configure webhook URL
5. Test with small real payment
6. Monitor for 24 hours
7. Go live! 🚀

---

## 🔗 Resources

- 📖 [Full Documentation](./FLUTTERWAVE_INTEGRATION.md)
- 🌐 [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
- 📚 [Flutterwave API Docs](https://developer.flutterwave.com/docs)
- 🧪 [Test Cards](https://developer.flutterwave.com/docs/integration-guides/testing-helpers)

---

## ✅ Verification Checklist

- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] App starts without errors
- [ ] Wallet page loads
- [ ] Flutterwave option visible
- [ ] Test payment completes successfully
- [ ] Wallet balance updated
- [ ] Transaction recorded in database
- [ ] Existing Paystack works
- [ ] Existing Cryptomus works

**All checked?** You're ready to go! 🎉

---

## 💡 Tips

1. **Always use test mode first** - Never test with live keys
2. **Check both redirect AND webhook** - Both should update wallet
3. **Monitor the first few payments** - Make sure everything works smoothly
4. **Keep credentials secure** - Never commit to git

---

## 🆘 Need Help?

1. Read [Full Documentation](./FLUTTERWAVE_INTEGRATION.md)
2. Check [Troubleshooting Section](#troubleshooting)
3. Review Flutterwave logs in dashboard
4. Check server and browser logs
5. Contact your development team

---

**Happy Integrating! 🚀**

Your SMS Pool platform now supports three payment methods working seamlessly together!

