# Flutterwave Card Payment Integration Guide

## 🎯 Overview

This document provides comprehensive setup and usage instructions for the Flutterwave card payment integration added to your SMS Pool SaaS platform.

**Status:** ✅ Complete - Zero Breaking Changes to Existing Systems

**Integration Date:** January 15, 2025

**Compatibility:** 
- ✅ Cryptomus (Crypto) - Fully Preserved
- ✅ Paystack (Card/Bank) - Fully Preserved
- ✅ All Existing Transactions - Backward Compatible

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Database Changes](#database-changes)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [Payment Flow](#payment-flow)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Security Considerations](#security-considerations)

---

## ✨ Features

### Payment Methods Supported
- ✅ **Debit/Credit Cards** (Visa, Mastercard, Verve)
- ✅ **Bank Transfer** (Direct bank transfer)
- ✅ **USSD** (Mobile phone payments)
- ✅ **Account Payment** (Saved accounts)

### Key Features
- 🔒 **Secure Payment Processing** with Flutterwave
- 💱 **Automatic Currency Conversion** (NGN → USD for storage)
- ✅ **Real-time Payment Verification**
- 🔄 **Webhook Integration** for reliable payment confirmation
- 📊 **Transaction Tracking** with detailed metadata
- 🚀 **Instant Wallet Funding** upon payment confirmation
- 🔁 **Duplicate Prevention** to avoid double-crediting
- 📱 **Mobile-Friendly** payment flow

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ 1. Initiate Payment
         ↓
┌─────────────────────────────────────┐
│   Frontend (FlutterwaveFunding)    │
│  - Amount input (NGN)               │
│  - User interaction                 │
└────────┬────────────────────────────┘
         │ 2. POST /api/flutterwave/initiate-payment
         ↓
┌─────────────────────────────────────┐
│   Backend API Route                 │
│  - Create pending transaction       │
│  - Initialize Flutterwave payment   │
└────────┬────────────────────────────┘
         │ 3. Return payment link
         ↓
┌─────────────────────────────────────┐
│   Flutterwave Payment Page          │
│  - User enters card details         │
│  - Payment processing               │
└────────┬────────────────────────────┘
         │ 4a. Redirect callback
         ↓
┌─────────────────────────────────────┐
│   Verify Payment API                │
│  - Verify with Flutterwave          │
│  - Update wallet balance            │
│  - Complete transaction             │
└─────────────────────────────────────┘
         ↑ 4b. Webhook (backup)
         │
┌─────────────────────────────────────┐
│   Flutterwave Webhook               │
│  - Signature verification           │
│  - Automatic payment confirmation   │
└─────────────────────────────────────┘
```

### Database Schema Extensions

The integration extends the existing `transactions` table without modifying existing data:

```sql
-- New columns added (all optional, backward compatible)
payment_method        TEXT      -- 'flutterwave', 'paystack', 'cryptomus', 'legacy'
gateway_transaction_id TEXT     -- Flutterwave tx_ref
gateway_reference     TEXT      -- Flutterwave flw_ref
gateway_status        TEXT      -- Payment status from gateway
gateway_metadata      JSONB     -- Additional payment details
```

---

## 🚀 Setup Instructions

### Step 1: Get Flutterwave Credentials

1. **Sign up for Flutterwave**
   - Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
   - Create an account or sign in
   - Complete KYC verification (required for live mode)

2. **Get API Keys**
   - Navigate to **Settings** → **API Keys**
   - Copy the following credentials:
     - **Public Key** (`FLPUBK_TEST-...` for test, `FLPUBK-...` for live)
     - **Secret Key** (`FLWSECK_TEST-...` for test, `FLWSECK-...` for live)
     - **Encryption Key** (optional, for enhanced security)

3. **Get Webhook Secret Hash**
   - Navigate to **Settings** → **Webhooks**
   - Copy the **Secret Hash**
   - Add webhook URL: `https://yourdomain.com/api/flutterwave/webhook`

### Step 2: Configure Environment Variables

Add the following to your `.env` or `.env.local` file:

```bash
# Flutterwave API Credentials
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash_here

# App URL (required for webhooks and redirects)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Important Notes:**
- Use `TEST` keys for development/testing
- Use `LIVE` keys for production only after testing
- Never commit `.env` file to version control
- Keep `SECRET_KEY` and `SECRET_HASH` secure

### Step 3: Run Database Migration

```bash
# If using Supabase
supabase migration up

# Or apply migration manually
psql -d your_database < supabase/migrations/20250115000001_add_payment_gateway_support.sql
```

**What this does:**
- Adds new columns to `transactions` table
- Creates indexes for performance
- Updates existing records (marks Paystack/Cryptomus transactions)
- Creates helper functions for transaction queries
- Creates analytics view for payment gateway stats

### Step 4: Install Dependencies (Already Done)

The integration uses existing dependencies:
- ✅ `axios` - For API calls
- ✅ `next` - Next.js framework
- ✅ `crypto` - Node.js built-in (for signatures)

No new dependencies required!

### Step 5: Configure Flutterwave Dashboard

1. **Set Webhook URL**
   ```
   https://yourdomain.com/api/flutterwave/webhook
   ```

2. **Enable Payment Methods**
   - Go to **Settings** → **Payment Methods**
   - Enable: Cards, Bank Transfer, USSD (as needed)

3. **Set Payment Limits** (optional)
   - Configure minimum/maximum amounts
   - Set transaction limits

4. **Customize Payment Page** (optional)
   - Upload your logo
   - Set brand colors
   - Customize payment page text

### Step 6: Test the Integration

```bash
# Start development server
npm run dev

# Navigate to wallet page
# http://localhost:3000/wallet

# Try a test payment with Flutterwave test cards
```

**Flutterwave Test Cards:**

| Card Number         | CVV | Expiry | PIN  | OTP    | Result     |
|---------------------|-----|--------|------|--------|------------|
| 5531886652142950   | 564 | 09/32  | 3310 | 12345  | Successful |
| 4187427415564246   | 828 | 09/32  | 3310 | 12345  | Successful |
| 5399838383838381   | 470 | 10/32  | 3310 | 12345  | Failed     |

---

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Public API key (client-side) | `FLPUBK_TEST-xxx` | ✅ Yes |
| `FLUTTERWAVE_SECRET_KEY` | Secret API key (server-side) | `FLWSECK_TEST-xxx` | ✅ Yes |
| `FLUTTERWAVE_SECRET_HASH` | Webhook signature verification | `your_hash` | ✅ Yes (for webhooks) |
| `NEXT_PUBLIC_APP_URL` | Your app's base URL | `https://example.com` | ✅ Yes |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLUTTERWAVE_ENCRYPTION_KEY` | Additional encryption (optional) | - |
| `NODE_ENV` | Environment mode | `development` |

---

## 💾 Database Changes

### New Columns in `transactions` Table

```sql
-- Added columns (all backward compatible)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'legacy';

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_reference TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_status TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS gateway_metadata JSONB DEFAULT '{}'::jsonb;
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_transactions_gateway_transaction_id 
ON public.transactions(gateway_transaction_id);

CREATE INDEX idx_transactions_payment_method 
ON public.transactions(payment_method);

CREATE INDEX idx_transactions_gateway_reference 
ON public.transactions(gateway_reference);
```

### Example Transaction Record

```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "type": "deposit",
  "amount": 3.03,  // USD (converted from NGN 5000)
  "description": "Wallet funding via Flutterwave - ₦5,000.00 - Ref: FLW-user-123-1234567890",
  "status": "completed",
  "payment_method": "flutterwave",
  "reference_id": "FLW-user-123-1234567890",
  "gateway_transaction_id": "FLW-user-123-1234567890",
  "gateway_reference": "FLW-REF-1234567890",
  "gateway_status": "successful",
  "gateway_metadata": {
    "amount_ngn": 5000,
    "amount_usd": 3.03,
    "currency": "NGN",
    "payment_type": "card",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    },
    "card": {
      "first_6digits": "539983",
      "last_4digits": "8381",
      "issuer": "MASTERCARD",
      "country": "NG",
      "type": "MASTERCARD"
    }
  },
  "created_at": "2025-01-15T12:00:00Z"
}
```

---

## 🌐 API Endpoints

### 1. POST `/api/flutterwave/initiate-payment`

Initialize a new Flutterwave payment.

**Request Body:**
```json
{
  "amount": 5000,
  "userId": "user-uuid",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "userPhone": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_link": "https://checkout.flutterwave.com/...",
    "tx_ref": "FLW-user-123-1234567890",
    "amount": 5000,
    "transaction_id": "db-transaction-uuid"
  }
}
```

### 2. POST `/api/flutterwave/verify-payment`

Verify a payment and update wallet balance.

**Request Body:**
```json
{
  "tx_ref": "FLW-user-123-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "successful",
    "amount": 5000,
    "amount_usd": 3.03,
    "currency": "NGN",
    "tx_ref": "FLW-user-123-1234567890",
    "flw_ref": "FLW-REF-1234567890",
    "previous_balance": 10.00,
    "new_balance": 13.03,
    "already_processed": false
  }
}
```

### 3. POST `/api/flutterwave/webhook`

Receive payment notifications from Flutterwave.

**Headers:**
```
verif-hash: your_webhook_signature
```

**Body:**
```json
{
  "event": "charge.completed",
  "data": {
    "id": 123456,
    "tx_ref": "FLW-user-123-1234567890",
    "flw_ref": "FLW-REF-1234567890",
    "amount": 5000,
    "currency": "NGN",
    "status": "successful"
  }
}
```

---

## 🎨 Components

### FlutterwaveFunding Component

Location: `components/wallet/flutterwave-funding.tsx`

**Props:**
```typescript
interface FlutterwaveFundingProps {
  userEmail: string;     // User's email
  userId: string;        // User's ID
  onSuccess: (amount: number) => void;  // Success callback
  onError?: (error: any) => void;       // Error callback (optional)
}
```

**Usage:**
```tsx
import { FlutterwaveFunding } from "@/components/wallet/flutterwave-funding";

<FlutterwaveFunding
  userEmail={user.email}
  userId={user.id}
  onSuccess={(amount) => {
    console.log(`Payment successful: $${amount}`);
    // Refresh wallet data
  }}
  onError={(error) => {
    console.error("Payment failed:", error);
  }}
/>
```

### WalletCard Component (Updated)

Location: `components/wallet/wallet-card.tsx`

Now includes three payment options:
1. **Flutterwave** - Primary (Cards, Bank, USSD)
2. **Paystack** - Alternative (Cards, Bank)
3. **Cryptomus** - Advanced (Cryptocurrency)

All existing functionality preserved!

---

## 💳 Payment Flow

### User Journey

```
1. User clicks "Add Funds" on wallet page
   ↓
2. Enters amount in NGN (minimum ₦100)
   ↓
3. Clicks "Fund Wallet" button
   ↓
4. Redirected to Flutterwave payment page
   ↓
5. Selects payment method (Card/Bank/USSD)
   ↓
6. Completes payment
   ↓
7. Redirected back to app
   ↓
8. Payment automatically verified
   ↓
9. Wallet balance updated instantly
   ↓
10. Success notification shown
```

### Technical Flow

```
1. Frontend: Create pending transaction in DB
2. Frontend: Call /api/flutterwave/initiate-payment
3. Backend: Initialize payment with Flutterwave API
4. Backend: Return payment link
5. Frontend: Redirect user to payment link
6. User: Complete payment on Flutterwave
7. Flutterwave: Redirect user back to app
8. Frontend: Call /api/flutterwave/verify-payment
9. Backend: Verify with Flutterwave API
10. Backend: Convert NGN to USD
11. Backend: Update wallet balance
12. Backend: Mark transaction as completed
13. Flutterwave: Send webhook (backup verification)
14. Backend: Process webhook if not already processed
```

### Currency Conversion

```
NGN Amount (User Input) → USD Amount (Storage)
                         ↓
                  Exchange Rate
                  (from database)
                         ↓
                  Wallet Balance
                  (stored in USD)
```

**Example:**
- User pays: ₦5,000
- Exchange rate: ₦1,650 = $1
- Stored amount: $3.03
- Displayed to user: ₦5,000 (using current rate)

---

## 🧪 Testing

### Test Mode Setup

1. Use test API keys (starting with `TEST`)
2. Use Flutterwave test cards (see table above)
3. No real money is charged in test mode

### Test Cards

**Successful Payment:**
```
Card: 5531886652142950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

**Failed Payment:**
```
Card: 5399838383838381
CVV: 470
Expiry: 10/32
PIN: 3310
OTP: 12345
```

### Test Checklist

- [ ] Payment initialization
- [ ] Payment redirect
- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Payment verification
- [ ] Wallet balance update
- [ ] Transaction record creation
- [ ] Webhook processing
- [ ] Duplicate prevention
- [ ] Error handling
- [ ] Currency conversion
- [ ] Existing Paystack functionality
- [ ] Existing Cryptomus functionality

### Testing Commands

```bash
# Run development server
npm run dev

# Check database migration
supabase migration list

# View recent transactions
psql -d your_db -c "SELECT * FROM transactions WHERE payment_method = 'flutterwave' ORDER BY created_at DESC LIMIT 10;"

# Test API endpoints
curl -X POST http://localhost:3000/api/flutterwave/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "userId": "test-user", "userEmail": "test@example.com"}'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid API credentials" Error

**Cause:** Wrong or missing API keys

**Solution:**
```bash
# Check .env file
cat .env | grep FLUTTERWAVE

# Verify keys are correct (no extra spaces)
# Test keys start with TEST, live keys don't
```

#### 2. Payment not reflecting in wallet

**Cause:** 
- Webhook not configured
- Exchange rate missing
- Verification failed

**Solution:**
```bash
# Check transaction status
SELECT * FROM transactions WHERE gateway_transaction_id = 'your-tx-ref';

# Manually verify payment
curl -X POST http://localhost:3000/api/flutterwave/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"tx_ref": "your-tx-ref"}'
```

#### 3. Webhook signature verification failed

**Cause:** Wrong webhook secret hash

**Solution:**
```bash
# Update .env with correct hash from Flutterwave dashboard
FLUTTERWAVE_SECRET_HASH=correct_hash_here

# Restart server
npm run dev
```

#### 4. "Minimum amount" error

**Cause:** Amount below ₦100

**Solution:**
```bash
# Flutterwave minimum is ₦100
# Update amount in frontend or backend
```

### Debug Mode

Enable detailed logging:

```typescript
// In services/flutterwave-api.ts
// Uncomment console.log statements

// Check browser console for frontend errors
// Check server logs for backend errors
```

### Health Checks

```bash
# Check API endpoints
curl http://localhost:3000/api/flutterwave/initiate-payment
curl http://localhost:3000/api/flutterwave/verify-payment
curl http://localhost:3000/api/flutterwave/webhook

# Should return endpoint info (GET requests)
```

---

## 🔐 Security Considerations

### Best Practices Implemented

1. **Server-Side Verification**
   - ✅ All payment verifications happen on server
   - ✅ Never trust client-side payment status
   - ✅ Double-verify with Flutterwave API

2. **Webhook Signature Verification**
   - ✅ Verify `verif-hash` header
   - ✅ Reject requests with invalid signatures
   - ✅ Compare with `FLUTTERWAVE_SECRET_HASH`

3. **Duplicate Prevention**
   - ✅ Check transaction status before processing
   - ✅ Use unique transaction references
   - ✅ Prevent double-crediting of wallets

4. **API Key Security**
   - ✅ Secret key only on server (never exposed to client)
   - ✅ Public key safe for client-side use
   - ✅ Keys stored in environment variables
   - ✅ Never commit keys to version control

5. **Data Validation**
   - ✅ Validate all input amounts
   - ✅ Check user existence before processing
   - ✅ Verify payment matches user

6. **Error Handling**
   - ✅ Graceful error messages (no sensitive info)
   - ✅ Detailed server-side logging
   - ✅ Failed transactions marked properly

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong webhook secret hash
- [ ] Rotate API keys periodically
- [ ] Monitor for suspicious transactions
- [ ] Set up rate limiting
- [ ] Enable 2FA on Flutterwave account
- [ ] Restrict API keys to specific IPs (optional)
- [ ] Set up transaction alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 📊 Monitoring & Analytics

### Payment Gateway Statistics

Query the analytics view:

```sql
-- View payment statistics by gateway
SELECT * FROM public.payment_gateway_stats;

-- Results:
-- payment_method | total_transactions | completed | pending | failed | total_deposits
-- flutterwave    | 150               | 145       | 3       | 2      | $450.00
-- paystack       | 200               | 195       | 2       | 3      | $600.00
-- cryptomus      | 50                | 48        | 1       | 1      | $150.00
```

### Transaction Queries

```sql
-- Recent Flutterwave transactions
SELECT 
  id,
  user_id,
  amount,
  status,
  gateway_status,
  created_at
FROM transactions
WHERE payment_method = 'flutterwave'
ORDER BY created_at DESC
LIMIT 20;

-- Failed payments (for review)
SELECT 
  gateway_transaction_id,
  amount,
  gateway_status,
  gateway_metadata->>'failure_reason' as reason,
  created_at
FROM transactions
WHERE payment_method = 'flutterwave'
  AND status = 'failed'
ORDER BY created_at DESC;

-- Today's revenue by gateway
SELECT 
  payment_method,
  COUNT(*) as transactions,
  SUM(amount) as total_usd
FROM transactions
WHERE type = 'deposit'
  AND status = 'completed'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY payment_method;
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Test mode fully tested
- [ ] All test cases passing
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Webhook URL configured in Flutterwave
- [ ] SSL certificate active (HTTPS)
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] KYC completed on Flutterwave
- [ ] Live API keys obtained

### Deployment Steps

1. **Switch to Live API Keys**
   ```bash
   # Update .env or deployment platform
   NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK-xxx (LIVE)
   FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx (LIVE)
   FLUTTERWAVE_SECRET_HASH=xxx (LIVE)
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Update Webhook URL**
   - Flutterwave Dashboard → Settings → Webhooks
   - Update to: `https://yourdomain.com/api/flutterwave/webhook`

3. **Deploy Application**
   ```bash
   # Build and deploy
   npm run build
   npm start
   
   # Or deploy to your platform (Vercel, etc.)
   vercel deploy --prod
   ```

4. **Test in Production**
   - Make a small real payment (₦100)
   - Verify wallet update
   - Check transaction record
   - Confirm webhook received

5. **Monitor First 24 Hours**
   - Watch for errors
   - Check payment success rate
   - Monitor webhook deliveries
   - Review transaction logs

### Rollback Plan

If issues occur:

```bash
# 1. Revert to previous deployment
git revert HEAD

# 2. Switch back to Paystack/Cryptomus only
# Comment out Flutterwave in WalletCard component

# 3. Database rollback (if needed)
# Transactions table changes are additive, so no rollback needed
# Just mark payment_method properly
```

---

## 📞 Support

### Flutterwave Support

- **Dashboard:** https://dashboard.flutterwave.com/
- **Documentation:** https://developer.flutterwave.com/docs
- **Support Email:** developers@flutterwavego.com
- **Slack Community:** https://bit.ly/34Vkzcg

### Integration Support

For issues with this integration:
1. Check this documentation
2. Review troubleshooting section
3. Check server and browser logs
4. Test with Flutterwave test cards
5. Contact your development team

---

## 📚 Additional Resources

- [Flutterwave API Documentation](https://developer.flutterwave.com/docs)
- [Test Cards and Credentials](https://developer.flutterwave.com/docs/integration-guides/testing-helpers)
- [Webhook Documentation](https://developer.flutterwave.com/docs/integration-guides/webhooks)
- [Security Best Practices](https://developer.flutterwave.com/docs/integration-guides/authentication)

---

## ✅ Summary

### What Was Implemented

1. ✅ **Database Extensions**
   - Added payment gateway support columns
   - Backward compatible with existing data
   - Performance indexes created

2. ✅ **Flutterwave API Service**
   - Full payment lifecycle support
   - Secure signature handling
   - Comprehensive error handling

3. ✅ **API Routes**
   - `/api/flutterwave/initiate-payment` - Start payment
   - `/api/flutterwave/verify-payment` - Confirm payment
   - `/api/flutterwave/webhook` - Automatic verification

4. ✅ **Frontend Components**
   - `FlutterwaveFunding` - Payment UI
   - Updated `WalletCard` - Integrated display

5. ✅ **Features**
   - Card payments (Visa, Mastercard, Verve)
   - Bank transfer support
   - USSD payments
   - Real-time verification
   - Webhook backup
   - Currency conversion (NGN → USD)
   - Duplicate prevention

### Zero Breaking Changes

- ✅ Cryptomus cryptocurrency payments still work
- ✅ Paystack card payments still work
- ✅ All existing transactions preserved
- ✅ Existing wallet balances unchanged
- ✅ No API changes to existing endpoints
- ✅ All components backward compatible

### Next Steps

1. Set up Flutterwave account
2. Add environment variables
3. Run database migration
4. Test with test cards
5. Deploy to production
6. Monitor transactions

---

**Integration Complete! 🎉**

Your platform now supports three payment methods:
- 💳 **Flutterwave** - Fast card payments
- 💳 **Paystack** - Alternative card payments
- 🪙 **Cryptomus** - Cryptocurrency payments

All working seamlessly together without breaking existing functionality!

