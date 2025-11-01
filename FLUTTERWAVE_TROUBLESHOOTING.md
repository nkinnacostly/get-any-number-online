# Flutterwave Integration - Troubleshooting Guide

## 🐛 Common Error: "No transaction was found for this id"

This error happens when Flutterwave can't find the transaction you're trying to verify.

### Possible Causes:

1. **Using Test Keys in Production (or vice versa)**
   - Make sure your keys match the environment
   - Test keys: `FLPUBK_TEST-...` and `FLWSECK_TEST-...`
   - Live keys: `FLPUBK-...` and `FLWSECK-...`

2. **Payment Was Cancelled**
   - User closed the modal before completing payment
   - Payment failed or was declined

3. **Wrong Transaction ID**
   - The callback might be returning a different ID structure
   - Need to log the actual response to see what we're getting

4. **Transaction Not Yet Processed**
   - Sometimes Flutterwave needs a moment to process
   - Added 1.5 second delay before verification

---

## 🔍 How to Debug

### Step 1: Check Browser Console

When you click "Fund Wallet", open browser DevTools (F12) and watch the Console tab.

You should see these logs:
```
Payment callback received: { ... }
Verifying payment with ID: 12345
Verification result: { ... }
```

### Step 2: Check What Flutterwave Returns

Look at the "Payment callback received" log. It should show something like:

```json
{
  "status": "successful",
  "transaction_id": "123456",
  "tx_ref": "FLW-user-123-1234567890",
  "flw_ref": "FLW-REF-123"
}
```

**Important:** Check which ID field is actually populated!

### Step 3: Verify Your API Keys

```bash
# Check your .env.local file
cat .env.local | grep FLUTTERWAVE

# Should show:
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
```

Make sure:
- ✅ Both keys start with `TEST` for testing
- ✅ Keys are from the same environment (both test or both live)
- ✅ No extra spaces or quotes

### Step 4: Check Server Logs

In your terminal where `npm run dev` is running, look for:

```
Verify payment request: { tx_ref: '...', transaction_id: '...' }
Verifying Flutterwave payment with ID: ...
Flutterwave verification response: { ... }
```

---

## ✅ What Should Happen (Successful Flow)

1. **User clicks "Fund Wallet"**
   ```
   Browser: Flutterwave script loaded
   ```

2. **Modal opens**
   ```
   Browser: Modal displayed
   Flutterwave: Transaction created on their side
   ```

3. **User completes payment**
   ```
   Browser: Payment processed
   Flutterwave: Transaction marked as successful
   ```

4. **Callback fires**
   ```
   Browser Console: Payment callback received: {...}
   Browser Console: Verifying payment with ID: 123456
   ```

5. **Backend verifies**
   ```
   Server: Verify payment request: {...}
   Server: Verifying Flutterwave payment with ID: 123456
   Server: Flutterwave verification response: {status: "success"}
   ```

6. **Wallet updated**
   ```
   Server: Payment verified and processed successfully
   Browser: Success! Wallet balance updated
   ```

---

## 🔧 Quick Fixes

### Fix 1: Verify API Keys Match

```bash
# In Flutterwave Dashboard
# Settings → API Keys
# Make sure you're using SAME environment keys

# Test Mode: Both keys should have "TEST"
# Live Mode: Both keys should NOT have "TEST"
```

### Fix 2: Check Payment Actually Completed

Make sure you're completing the test payment:
1. Enter test card: `5531886652142950`
2. CVV: `564`
3. Expiry: `09/32`
4. Click "Pay"
5. Enter PIN: `3310`
6. Enter OTP: `12345`
7. **Wait for success message**

Don't close the modal prematurely!

### Fix 3: Use Test Mode

For testing, always use:
- Test public key starting with `FLPUBK_TEST-`
- Test secret key starting with `FLWSECK_TEST-`
- Test cards from Flutterwave documentation

### Fix 4: Check Network Tab

In DevTools → Network tab:
1. Look for call to `/api/flutterwave/verify-payment`
2. Check the **Request Payload**
3. Check the **Response**
4. Screenshot and share if you need help

---

## 🧪 Test the Integration

### Full Test Checklist:

```bash
# 1. Start fresh
npm run dev

# 2. Open browser console (F12)

# 3. Go to wallet
http://localhost:3000/wallet

# 4. Click "Fund Wallet"

# 5. Select Flutterwave

# 6. Enter amount: ₦1000

# 7. Click "Fund Wallet" button
# ✅ Modal should open

# 8. Use test card
Card: 5531886652142950
CVV: 564
Expiry: 09/32

# 9. Complete payment
PIN: 3310
OTP: 12345

# 10. Watch console logs
# Should show: Payment callback received → Verifying → Success
```

---

## 📞 Still Having Issues?

### Collect This Information:

1. **Browser Console Logs**
   - Screenshot of console after clicking "Fund Wallet"
   - Look for errors or the "Payment callback received" log

2. **Server Logs**
   - Copy the terminal output
   - Look for verification attempts

3. **Environment Check**
   ```bash
   echo "Public Key: $(cat .env.local | grep NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY)"
   echo "Secret Key: $(cat .env.local | grep FLUTTERWAVE_SECRET_KEY | cut -c1-50)"
   ```

4. **Network Response**
   - DevTools → Network → `/api/flutterwave/verify-payment`
   - Copy the response

---

## 💡 Most Common Solution

**99% of the time, it's one of these:**

1. ✅ **Using different environment keys** (test public + live secret)
   - **Fix:** Use matching keys (both test or both live)

2. ✅ **Payment not actually completing**
   - **Fix:** Complete the full payment flow with test card

3. ✅ **Modal closing too early**
   - **Fix:** Wait for Flutterwave success message

4. ✅ **Wrong Flutterwave account**
   - **Fix:** Make sure keys are from your actual Flutterwave account

---

## 🎯 Next Steps

1. Check browser console logs
2. Verify your API keys match (both test or both live)
3. Try test payment with full completion
4. Share console logs if still having issues

The integration is working - we just need to make sure Flutterwave is returning the right data! 🚀

