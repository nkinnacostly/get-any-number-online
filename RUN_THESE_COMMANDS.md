# 🚀 Run These Commands in Your Terminal

You're logged in! Now run these commands:

## Step 1: List Your Projects

```bash
cd /Users/nkinnacostly/Documents/mysms-pool
supabase projects list
```

This will show your Supabase projects. Note the **Reference ID**.

---

## Step 2: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your project's reference ID from step 1.

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

---

## Step 3: Push the Migration

```bash
supabase db push
```

This will apply the Flutterwave migration!

---

## ✅ Expected Output

You should see:
```
Applying migration 20250115000001_add_payment_gateway_support.sql...
Finished supabase db push.
```

---

## 🎯 All Three Commands Together

```bash
cd /Users/nkinnacostly/Documents/mysms-pool
supabase projects list
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## 📊 Verify It Worked

After pushing, verify with:

```bash
supabase db diff
```

Should say: "No schema changes detected" (meaning everything is applied)

---

## 🐛 Troubleshooting

**"Project already linked"**
- Good! Just run: `supabase db push`

**"Migration already applied"**
- Perfect! It means the migration is already in your database

**"No migrations to apply"**
- The migration might already be applied. Verify in Supabase Dashboard

---

## ✨ After Migration Success

1. Create `.env.local` with your Flutterwave keys
2. Restart app: `npm run dev`
3. Test payment: http://localhost:3000/wallet

Let me know the output from `supabase projects list`!

