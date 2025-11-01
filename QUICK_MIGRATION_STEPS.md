# Quick Migration Steps - Supabase CLI Method

## 🚀 Step 1: Get Your Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name: "CLI Access"
4. Copy the token (starts with `sbp_...`)

## 🔑 Step 2: Login with Token

**Option A: Set Environment Variable (Recommended)**

```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

**Option B: Login with Token Flag**

```bash
supabase login --token sbp_your_token_here
```

## 🔗 Step 3: Link Your Project

Find your project reference ID:
1. Go to: https://supabase.com/dashboard
2. Open your project
3. Settings → General → Reference ID

Then run:

```bash
supabase link --project-ref your-project-ref-here
```

## 📊 Step 4: Push the Migration

```bash
supabase db push
```

This will apply the migration file:
`supabase/migrations/20250115000001_add_payment_gateway_support.sql`

## ✅ Step 5: Verify

Check if it worked:

```bash
supabase db diff
```

Should show: "No schema changes detected"

---

## 🎯 All Commands in Order

```bash
# 1. Set token (replace with your actual token)
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# 2. Link project (replace with your project ref)
supabase link --project-ref your-project-ref-here

# 3. Push migration
supabase db push

# 4. Verify
supabase db diff
```

---

## 🐛 Troubleshooting

**"Access token not provided"**
- Make sure you exported the token in the same terminal session
- Or use the `--token` flag: `supabase db push --token sbp_your_token`

**"Project not found"**
- Check your project reference ID in Supabase dashboard
- Make sure you have access to the project

**"Migration already applied"**
- This is OK! It means the migration was already run
- You can verify with: `supabase db diff`

---

## 📝 Alternative: Manual Application

If CLI continues to have issues, use the Dashboard method:

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of: `supabase/migrations/20250115000001_add_payment_gateway_support.sql`
3. Paste and click **Run**
4. Done! ✅

