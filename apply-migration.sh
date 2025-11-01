#!/bin/bash

# Apply Flutterwave Database Migration Script
# This script helps you apply the migration to your Supabase database

echo "🚀 Flutterwave Integration - Database Migration"
echo "================================================"
echo ""

# Check if migration file exists
if [ ! -f "supabase/migrations/20250115000001_add_payment_gateway_support.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "   Expected: supabase/migrations/20250115000001_add_payment_gateway_support.sql"
    exit 1
fi

echo "✅ Migration file found"
echo ""

# Method 1: Using Supabase CLI (Recommended)
echo "Method 1: Using Supabase CLI (Recommended)"
echo "-------------------------------------------"
echo ""
echo "Run these commands:"
echo ""
echo "  # Step 1: Login to Supabase (if not already logged in)"
echo "  supabase login"
echo ""
echo "  # Step 2: Link your project (if not already linked)"
echo "  supabase link --project-ref YOUR_PROJECT_REF"
echo ""
echo "  # Step 3: Push the migration"
echo "  supabase db push"
echo ""
echo "-------------------------------------------"
echo ""

# Method 2: Manual SQL execution
echo "Method 2: Via Supabase Dashboard (Easy)"
echo "-------------------------------------------"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Open your project"
echo "3. Navigate to 'SQL Editor' in sidebar"
echo "4. Click 'New Query'"
echo "5. Copy contents of:"
echo "   supabase/migrations/20250115000001_add_payment_gateway_support.sql"
echo "6. Paste into SQL Editor"
echo "7. Click 'Run'"
echo ""
echo "-------------------------------------------"
echo ""

# Method 3: Using psql
echo "Method 3: Using psql (Direct)"
echo "-------------------------------------------"
echo ""
echo "If you have your database connection string:"
echo ""
echo "  psql 'postgresql://postgres:PASSWORD@HOST:5432/postgres' \\"
echo "    -f supabase/migrations/20250115000001_add_payment_gateway_support.sql"
echo ""
echo "Get your connection string from:"
echo "Supabase Dashboard → Settings → Database → Connection String"
echo ""
echo "-------------------------------------------"
echo ""

# Check for Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is installed"
    echo ""
    
    # Check if linked
    if supabase status &> /dev/null; then
        echo "📊 Your Supabase project is linked!"
        echo ""
        echo "Ready to push? Run:"
        echo "  supabase db push"
        echo ""
    else
        echo "⚠️  Project not linked yet. Run:"
        echo "  supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
    fi
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase (macOS)"
    echo "  npm install -g supabase (any OS)"
    echo ""
    echo "Or use Method 2 (Dashboard) instead."
    echo ""
fi

echo "================================================"
echo "📚 For detailed instructions, see:"
echo "   SUPABASE_MIGRATION_GUIDE.md"
echo "================================================"

