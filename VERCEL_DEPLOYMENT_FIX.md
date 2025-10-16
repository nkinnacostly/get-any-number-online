# 🚀 Fix Vercel Deployment Errors

## Error Summary

Your Vercel deployment is failing because **environment variables are missing**:

1. ❌ `EXCHANGERATE_API_KEY` not configured
2. ❌ `SUPABASE_SERVICE_ROLE_KEY` is required

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your project: **mysms-pool**
3. Go to **Settings** tab
4. Click **Environment Variables** in the sidebar

### Step 2: Add All Required Environment Variables

Add the following environment variables one by one:

| Variable Name                       | Value                                                                                                                                                                                                                         | Environment                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | `https://vjzsjwwqkykwoxpildqp.supabase.co`                                                                                                                                                                                    | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTYxMjIsImV4cCI6MjA3MzY5MjEyMn0.zMGRwB5uZ6__DOZZMFZ3YW1ULOPo6OvG_jBlySm8kLY`            | Production, Preview, Development |
| `NEXT_PUBLIC_SMSPOOL_API_KEY`       | `zWKyL27l4iKMmw4EcRvNFeGN6RBRDGlk`                                                                                                                                                                                            | Production, Preview, Development |
| `NEXT_PUBLIC_EXCHANGE_RATE_API_KEY` | `c2d7dfe6615de4f7d69ad231`                                                                                                                                                                                                    | Production, Preview, Development |
| `NEXT_PUBLIC_CRYPTOMUS_API_KEY`     | `kJjFs88YfsbbugzA1Wal3Pz5IrhqfLKVpEZI2ccMVQkSHPbqXvh8PqBDIdbUOVMBAljzEByDaPnjISSecM48KOOny3I4NvQqIdHoza5R0k5AC5A6fLnYJoXtIR3CvttG`                                                                                            | Production, Preview, Development |
| `NEXT_PUBLIC_CRYPTOMUS_MERCHANT_ID` | `be06a9a8-2941-4ed1-b354-61d05a09efb1`                                                                                                                                                                                        | Production, Preview, Development |
| `NEXT_PUBLIC_PAYSTACK_PUBLICK_KEY`  | `pk_test_ae1e9fcb2b6bed1ce08a5e98d085a873234047f8`                                                                                                                                                                            | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL`               | `https://www.getanynumberonline.com`                                                                                                                                                                                          | Production                       |
| `NEXT_PUBLIC_APP_URL`               | `https://mysms-pool-git-main.vercel.app`                                                                                                                                                                                      | Preview, Development             |
| **`EXCHANGERATE_API_KEY`** ⚠️       | `c2d7dfe6615de4f7d69ad231`                                                                                                                                                                                                    | Production, Preview, Development |
| **`SUPABASE_SERVICE_ROLE_KEY`** ⚠️  | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODExNjEyMiwiZXhwIjoyMDczNjkyMTIyfQ.R1z7VuIZeeRFlvSs4ihvwQfB0yKXj-qPm3ZBe7dBlik` | Production, Preview, Development |
| `CRON_SECRET`                       | (generate a random secret)                                                                                                                                                                                                    | Production, Preview, Development |

### Step 3: How to Add Each Variable

For each variable:

1. Click **"Add New"** button
2. Enter the **Key** (variable name from table above)
3. Enter the **Value** (from table above)
4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 4: Generate CRON_SECRET

For the `CRON_SECRET`, generate a random secure string:

```bash
# Run this in your terminal to generate a secure secret
openssl rand -base64 32
```

Copy the output and use it as the value for `CRON_SECRET`.

## Important Notes

### ⚠️ Critical Variables (Must Add These!)

These two are causing your build to fail:

- **`EXCHANGERATE_API_KEY`** - Server-side API key (no `NEXT_PUBLIC_` prefix)
- **`SUPABASE_SERVICE_ROLE_KEY`** - Server-side Supabase key (no `NEXT_PUBLIC_` prefix)

### 🔒 Security Note

Variables **without** `NEXT_PUBLIC_` prefix are:

- ✅ Only available on the server
- ✅ Never exposed to the browser
- ✅ Secure for API keys and secrets

Variables **with** `NEXT_PUBLIC_` prefix are:

- ⚠️ Exposed to the browser
- ⚠️ Visible in client-side code
- ⚠️ Only use for public keys

## After Adding Variables

### Option 1: Redeploy from Vercel Dashboard

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** menu
4. Select **"Redeploy"**

### Option 2: Push a New Commit

```bash
git commit --allow-empty -m "Trigger redeploy after adding env vars"
git push origin main
```

## Verify Deployment

Once redeployed, check:

1. ✅ Build completes successfully
2. ✅ No environment variable errors
3. ✅ App loads correctly
4. ✅ Exchange rates display properly

## Quick Copy-Paste Guide

Here's a quick reference table you can copy from:

```bash
# Server-side only (NO NEXT_PUBLIC_ prefix)
EXCHANGERATE_API_KEY=c2d7dfe6615de4f7d69ad231
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODExNjEyMiwiZXhwIjoyMDczNjkyMTIyfQ.R1z7VuIZeeRFlvSs4ihvwQfB0yKXj-qPm3ZBe7dBlik
CRON_SECRET=<generate-with-openssl-rand-base64-32>

# Client-side (WITH NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://vjzsjwwqkykwoxpildqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenNqd3dxa3lrd294cGlsZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTYxMjIsImV4cCI6MjA3MzY5MjEyMn0.zMGRwB5uZ6__DOZZMFZ3YW1ULOPo6OvG_jBlySm8kLY
NEXT_PUBLIC_SMSPOOL_API_KEY=zWKyL27l4iKMmw4EcRvNFeGN6RBRDGlk
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=c2d7dfe6615de4f7d69ad231
NEXT_PUBLIC_CRYPTOMUS_API_KEY=kJjFs88YfsbbugzA1Wal3Pz5IrhqfLKVpEZI2ccMVQkSHPbqXvh8PqBDIdbUOVMBAljzEByDaPnjISSecM48KOOny3I4NvQqIdHoza5R0k5AC5A6fLnYJoXtIR3CvttG
NEXT_PUBLIC_CRYPTOMUS_MERCHANT_ID=be06a9a8-2941-4ed1-b354-61d05a09efb1
NEXT_PUBLIC_PAYSTACK_PUBLICK_KEY=pk_test_ae1e9fcb2b6bed1ce08a5e98d085a873234047f8
NEXT_PUBLIC_APP_URL=https://www.getanynumberonline.com
```

## Troubleshooting

### Build Still Fails After Adding Variables?

1. **Double-check variable names** - They must match exactly (case-sensitive)
2. **Verify all environments are selected** - Production, Preview, Development
3. **Clear build cache**:
   - Go to Settings → General
   - Scroll to "Build & Development Settings"
   - Enable "Clear build cache" for next deployment

### Variables Not Loading?

1. Make sure there are **no extra spaces** in variable names or values
2. Redeploy after adding variables
3. Check Vercel deployment logs for specific errors

## Summary

The issue is simple: **Vercel needs your environment variables to build your app**.

✅ Add all variables from the table above to Vercel
✅ Redeploy
✅ Your app will build successfully!

---

**Next Step**: Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add the variables above. 🚀
