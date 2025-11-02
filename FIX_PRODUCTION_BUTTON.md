# 🚨 Quick Fix: Fund Wallet Button Not Working in Production

## What I Changed

I've updated the `flutterwave-funding.tsx` component with:

✅ **Enhanced debugging** - Detailed console logs  
✅ **Visual indicators** - Shows loading/error states  
✅ **Better error messages** - Tells you exactly what's wrong  
✅ **Environment validation** - Checks if keys are configured  

---

## 🎯 Most Likely Cause

**The `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` environment variable is missing from your production environment.**

---

## ⚡ Quick Fix (5 Minutes)

### Step 1: Check Locally First

```bash
# Run the environment checker
npm run check-env
```

**If you see errors**, fix your `.env.local` first, then continue.

**If you see ✅**, proceed to add them to production.

---

### Step 2: Add to Production (Vercel)

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**
3. **Click**: Settings → Environment Variables
4. **Add these 3 variables**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | `FLPUBK_TEST-your-key-here` | All |
| `FLUTTERWAVE_SECRET_KEY` | `FLWSECK_TEST-your-key-here` | All |
| `FLUTTERWAVE_WEBHOOK_SECRET` | `your-webhook-secret` | All |

5. **Redeploy**:
   - Go to: Deployments tab
   - Click: "..." menu on latest deployment
   - Click: "Redeploy"

6. **Wait 2-3 minutes** for deployment to finish

---

### Step 3: Test in Production

1. **Open your production site**
2. **Press F12** (open DevTools)
3. **Go to Console tab**
4. **Go to Wallet page**
5. **Enter amount**: 1000
6. **Click "Fund Wallet"**

**You should see:**
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: true
FlutterwaveCheckout available: true
```

**Then the modal should open!** ✅

---

## 🔍 Debugging in Production

### Check 1: Console Logs

**Open production site → F12 → Console**

Look for one of these:

#### ✅ Success (Modal Opens):
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: true
Opening Flutterwave modal...
```

#### ❌ Missing Environment Variable:
```
Fund Wallet button clicked
Public key configured: No
Error: NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is not set
```
**Fix**: Add environment variable (see Step 2)

#### ❌ Script Not Loading:
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: false
```
**Fix**: Check CSP headers or network (see full checklist)

#### ❌ Nothing Appears:
- JavaScript error occurred
- Check for red errors in console
- Try hard refresh (Ctrl+Shift+R)

---

### Check 2: Visual Indicators

The component now shows status alerts:

| Alert | Color | Meaning | Action |
|-------|-------|---------|--------|
| "Loading payment system..." | 🟡 Yellow | Script loading | Wait 2 seconds |
| "Payment system failed to load" | 🔴 Red | Script didn't load | Check network/CSP |
| "Payment system not configured" | 🔴 Red | Env var missing | Add env var |
| No alert showing | ✅ Green | Ready! | Click button |

---

## 📋 Environment Variables Reference

### Where to get them:

1. **Flutterwave Dashboard**: https://dashboard.flutterwave.com
2. **Go to**: Settings → API
3. **Toggle**: Test Mode (for testing)
4. **Copy**:
   - Public Key → `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
   - Secret Key → `FLUTTERWAVE_SECRET_KEY`
   - Webhook Secret → `FLUTTERWAVE_WEBHOOK_SECRET`

### Test vs Live:

**Test Mode** (for development):
```bash
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-abc123...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xyz789...
```

**Live Mode** (for production):
```bash
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK-abc123...
FLUTTERWAVE_SECRET_KEY=FLWSECK-xyz789...
```

⚠️ **Important**: Both keys must be from the same environment (both TEST or both LIVE)!

---

## 🧪 Test with Test Card

Once deployed, test with Flutterwave test card:

```
Card Number: 5531886652142950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

**Expected flow:**
1. Enter ₦1000
2. Click "Fund Wallet"
3. Modal opens
4. Enter test card details
5. Payment succeeds
6. Modal closes
7. Success message shows
8. Wallet balance increases

---

## 🆘 Still Not Working?

### Option 1: Run Local Diagnostics

```bash
# Check environment variables
npm run check-env

# If errors, fix .env.local then test
npm run dev
```

### Option 2: Check Production

Open production site console and send me:

1. **Screenshot of console** after clicking button
2. **Any red error messages**
3. **Network tab** filtered for "flutterwave"
4. **What hosting platform** (Vercel/Netlify/etc)

### Option 3: Full Diagnostic

See: `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for comprehensive troubleshooting.

---

## 📦 Files Changed

- ✅ `components/wallet/flutterwave-funding.tsx` - Enhanced logging
- ✅ `check-env.js` - New diagnostic script
- ✅ `package.json` - Added `check-env` script
- ✅ `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Full troubleshooting guide
- ✅ `FIX_PRODUCTION_BUTTON.md` - This quick fix guide

---

## ✅ Verification

After fixing, you should:

- [ ] See console log: "Public key configured: Yes"
- [ ] See console log: "Script loaded: true"
- [ ] No red error alerts on page
- [ ] Button is not disabled
- [ ] Clicking button opens Flutterwave modal
- [ ] Can complete test payment
- [ ] Wallet balance updates

---

## 🎉 Summary

**90% of the time**, the issue is just missing the environment variable in production.

**Quick fix:**
1. Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` to your hosting platform
2. Redeploy
3. Hard refresh browser

That's it! 🚀

---

**Need help?** Check console logs and share what you see!

