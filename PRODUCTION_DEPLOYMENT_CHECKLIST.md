# Production Deployment Checklist - Flutterwave Integration 🚀

## 🚨 Issue: "Fund Wallet" Button Not Clicking in Production

This guide helps you debug and fix the "Fund Wallet" button not responding in production.

---

## 📋 Quick Diagnostic Steps

### Step 1: Check Browser Console

1. **Open your production site**
2. **Press F12** to open DevTools
3. **Go to Console tab**
4. **Click "Fund Wallet" button**

**What to look for:**

✅ **If you see:**
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: true
FlutterwaveCheckout available: true
Opening Flutterwave modal with config: {...}
```
→ **System is working!** Modal should open.

❌ **If you see:**
```
Fund Wallet button clicked
Public key configured: No
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is not set
```
→ **Environment variable missing** - See Step 2

❌ **If you see:**
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: false
FlutterwaveCheckout available: false
```
→ **Script not loading** - See Step 3

❌ **If you see NOTHING:**
→ **JavaScript error** or **button not actually clicked** - See Step 4

---

## Step 2: Fix Missing Environment Variables

### For Vercel:

1. **Go to your Vercel dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Add these variables:**

```bash
# Flutterwave Public Key (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-xxxxxxxxxxxxxxxx

# Flutterwave Secret Key (server-side only)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxx

# Flutterwave Webhook Secret
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret-here
```

4. **Important: Select "All" environments** (Production, Preview, Development)

5. **Redeploy your app**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - OR: Push a new commit to trigger deployment

### For Netlify:

1. **Go to Site settings → Build & deploy → Environment**

2. **Add the same variables** (without quotes):
```
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY
FLUTTERWAVE_SECRET_KEY
FLUTTERWAVE_WEBHOOK_SECRET
```

3. **Trigger new deployment**:
   - Go to Deploys → Trigger deploy → Deploy site

### For Other Platforms:

- **Railway**: Settings → Variables
- **Render**: Environment → Environment Variables
- **Heroku**: Settings → Config Vars

**⚠️ Critical:** The public key MUST start with `NEXT_PUBLIC_` to be available in the browser!

---

## Step 3: Fix Script Loading Issues

### Check Network Tab:

1. Open DevTools → **Network** tab
2. Refresh the page
3. Search for: `checkout.flutterwave.com`

**If you see the script:**
✅ Status 200 - Script loaded successfully
❌ Status 404/403 - Blocked by firewall or CSP
❌ Status Failed - Network issue

### Fix Content Security Policy (CSP):

If you have CSP headers, add Flutterwave to allowed sources:

**In `next.config.js`:**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.flutterwave.com",
              "connect-src 'self' https://api.flutterwave.com https://checkout.flutterwave.com",
              "frame-src https://checkout.flutterwave.com",
              "img-src 'self' data: https:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

**If using Vercel Headers:**

Create/update `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.flutterwave.com; connect-src 'self' https://api.flutterwave.com https://checkout.flutterwave.com;"
        }
      ]
    }
  ]
}
```

---

## Step 4: Check for JavaScript Errors

### Look for React/Next.js Errors:

**In Console tab, look for:**

❌ **Hydration errors**:
```
Warning: Text content did not match...
```
→ Clear browser cache and hard refresh (Ctrl+Shift+R)

❌ **React errors**:
```
Error: Minified React error #...
```
→ Check your Next.js version and React version compatibility

❌ **Module not found**:
```
Module not found: Can't resolve...
```
→ Rebuild and redeploy

### Fix: Clear Build Cache

**Vercel:**
```bash
# In your project
vercel --prod --force
```

**Netlify:**
- Deploys → Clear cache and deploy site

**Local:**
```bash
rm -rf .next
npm run build
```

---

## Step 5: Test Locally First

Before debugging production, make sure it works locally:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp env.local.template .env.local

# 3. Add your keys to .env.local
nano .env.local

# 4. Run development server
npm run dev

# 5. Test at http://localhost:3000/wallet
```

**If it works locally but not in production:**
→ Environment variables are the issue (see Step 2)

**If it doesn't work locally:**
→ Code issue - check console for errors

---

## 🔍 Enhanced Debugging (Updated Component)

I've added comprehensive logging to the component. After deploying the updated code:

### What You'll See in Console:

**On page load:**
```
Flutterwave script loaded
```

**When clicking "Fund Wallet":**
```
Fund Wallet button clicked
Public key configured: Yes
Script loaded: true
FlutterwaveCheckout available: true
Generated tx_ref: FLW-xxx-123456789
Opening Flutterwave modal with config: {...}
```

**If successful:**
```
Flutterwave callback: {...}
Payment callback received: {...}
Verifying payment with ID: 123456
```

### Visual Indicators Added:

1. **🟡 Yellow Alert**: "Loading payment system..."
   - Shows while script is loading
   - Normal for 1-2 seconds

2. **🔴 Red Alert**: "Payment system failed to load"
   - Script failed to load from Flutterwave
   - Check CSP/network issues

3. **🔴 Red Alert**: "Payment system not configured"
   - Environment variable missing
   - Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`

---

## ✅ Verification Checklist

After making fixes, verify:

- [ ] Environment variables set in hosting platform
- [ ] Variables start with `NEXT_PUBLIC_` for frontend
- [ ] Redeployed after adding variables
- [ ] Browser console shows "Public key configured: Yes"
- [ ] Browser console shows "Script loaded: true"
- [ ] Yellow "Loading..." alert disappears after 2 seconds
- [ ] No red error alerts showing
- [ ] Button is not disabled
- [ ] Clicking button logs "Fund Wallet button clicked"
- [ ] Modal opens after clicking button

---

## 🚨 Common Issues & Solutions

### Issue 1: Button Does Nothing

**Symptoms:**
- Click button → nothing happens
- No console logs

**Solutions:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check if JavaScript is enabled
4. Try different browser
5. Check for ad blockers blocking Flutterwave

### Issue 2: "Payment system not configured"

**Symptoms:**
- Red error message
- Console: "Public key configured: No"

**Solution:**
1. Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` to environment variables
2. Redeploy
3. Hard refresh browser

### Issue 3: Script Loading Forever

**Symptoms:**
- Yellow "Loading payment system..." never disappears

**Solution:**
1. Check Network tab for failed requests
2. Add Flutterwave to CSP (see Step 3)
3. Check if firewall is blocking
4. Try from different network

### Issue 4: Button Disabled

**Symptoms:**
- Button is grayed out
- Can't click it

**Reasons:**
- Amount not entered (enter at least ₦100)
- Script still loading (wait 2 seconds)
- Error state from previous attempt (refresh page)

---

## 📞 Still Not Working?

### Collect This Debug Info:

1. **Browser Console Screenshot**
   - Full console after clicking button
   - Include any errors (red text)

2. **Network Tab Screenshot**
   - Filter for "flutterwave"
   - Show request status

3. **Environment Variables**
   ```bash
   # Run locally to verify keys exist
   echo $NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY | cut -c1-20
   # Should show: FLPUBK_TEST-xxxxxxxx
   ```

4. **Hosting Platform**
   - Vercel / Netlify / Other?
   - Deployment URL

5. **What happens when you click?**
   - Nothing
   - Error message
   - Page refresh
   - Something else

---

## 🎯 Quick Fix (Most Common)

**90% of the time, it's this:**

```bash
# 1. Go to your hosting dashboard (Vercel/Netlify/etc)

# 2. Add environment variable:
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-your-actual-key

# 3. Redeploy

# 4. Hard refresh browser (Ctrl+Shift+R)

# Done! ✅
```

---

## 📚 Related Files

- Component: `components/wallet/flutterwave-funding.tsx`
- API Route: `app/api/flutterwave/verify-payment/route.ts`
- Service: `services/flutterwave-api.ts`
- Environment Template: `env.local.template`

---

## ✅ Expected Behavior

When everything is working correctly:

1. Page loads → Yellow "Loading..." alert for 1-2 seconds → Disappears
2. Enter amount (e.g., 1000)
3. Click "Fund Wallet" button
4. Console logs appear
5. Flutterwave modal opens (popup)
6. Complete payment
7. Modal closes
8. Success message shows
9. Wallet balance updates

That's it! 🎉

