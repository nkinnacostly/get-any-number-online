#!/bin/bash

# Flutterwave Migration - Push to Supabase
# Run this after setting your SUPABASE_ACCESS_TOKEN

echo "🚀 Pushing Flutterwave Migration to Supabase"
echo "=============================================="
echo ""

# Check if token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN not set"
    echo ""
    echo "Please set your Supabase access token:"
    echo ""
    echo "  export SUPABASE_ACCESS_TOKEN=sbp_your_token_here"
    echo ""
    echo "Get your token from:"
    echo "  https://supabase.com/dashboard/account/tokens"
    echo ""
    exit 1
fi

echo "✅ Access token found"
echo ""

# Check if project is linked
if [ -f ".supabase/config.toml" ]; then
    echo "✅ Project already linked"
    echo ""
else
    echo "⚠️  Project not linked yet"
    echo ""
    echo "Run this command with your project reference ID:"
    echo ""
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Find your project ref at:"
    echo "  https://supabase.com/dashboard → Your Project → Settings → General"
    echo ""
    exit 1
fi

# Push the migration
echo "📊 Pushing migration..."
echo ""

supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Verifying changes..."
    echo ""
    supabase db diff
    echo ""
    echo "=============================================="
    echo "✅ All done!"
    echo ""
    echo "Next steps:"
    echo "1. Add Flutterwave keys to .env.local"
    echo "2. Restart your app: npm run dev"
    echo "3. Test payment at: http://localhost:3000/wallet"
    echo ""
else
    echo ""
    echo "❌ Migration failed"
    echo ""
    echo "Try applying manually via Supabase Dashboard:"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. SQL Editor → New Query"
    echo "3. Copy: supabase/migrations/20250115000001_add_payment_gateway_support.sql"
    echo "4. Run"
    echo ""
fi

