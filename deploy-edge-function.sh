#!/bin/bash
# Script to deploy edge function to Supabase

set -e  # Exit on error

echo "🚀 Deploying Exchange Rate Edge Function to Supabase..."
echo ""

# Get environment values from .env file
EXCHANGERATE_API_KEY=$(grep "^EXCHANGERATE_API_KEY=" .env 2>/dev/null | cut -d'=' -f2-)
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env 2>/dev/null | cut -d'=' -f2-)
SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env 2>/dev/null | cut -d'=' -f2-)

# Ask for ExchangeRate API key if not found
if [ -z "$EXCHANGERATE_API_KEY" ]; then
    echo "⚠️  EXCHANGERATE_API_KEY not found in .env"
    echo "Please enter your ExchangeRate-API key:"
    echo "(Get it from: https://www.exchangerate-api.com/)"
    read -r EXCHANGERATE_API_KEY
fi

# Check required variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env"
    exit 1
fi

echo "✅ Configuration loaded"
echo ""

# Set Supabase secrets
echo "📝 Setting Supabase secrets..."
echo ""

echo "Setting EXCHANGERATE_API_KEY..."
supabase secrets set EXCHANGERATE_API_KEY="$EXCHANGERATE_API_KEY" --project-ref vjzsjwwqkykwoxpildqp

echo "Setting SUPABASE_URL..."
supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref vjzsjwwqkykwoxpildqp

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_KEY" --project-ref vjzsjwwqkykwoxpildqp

echo ""
echo "✅ Secrets set successfully!"
echo ""

# Deploy edge function
echo "🚀 Deploying update-exchange-rate function..."
echo ""
supabase functions deploy update-exchange-rate --project-ref vjzsjwwqkykwoxpildqp

echo ""
echo "✅ Edge function deployed successfully!"
echo ""

# Get anon key for testing
ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env 2>/dev/null | cut -d'=' -f2-)

# Test the function
if [ -n "$ANON_KEY" ]; then
    echo "🧪 Testing the edge function..."
    echo ""
    
    PROJECT_REF="vjzsjwwqkykwoxpildqp"
    FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/update-exchange-rate"
    
    echo "Calling: $FUNCTION_URL"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json")
    
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Function test successful! Exchange rate updated."
    else
        echo "⚠️  Function returned unexpected response."
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up pg_cron for daily updates:"
echo "   - Go to: https://supabase.com/dashboard/project/vjzsjwwqkykwoxpildqp/database/extensions"
echo "   - Enable 'pg_cron' and 'http' extensions"
echo "   - Go to: https://supabase.com/dashboard/project/vjzsjwwqkykwoxpildqp/sql/new"
echo "   - Run the SQL in: setup-cron.sql"
echo ""
echo "2. Verify in your app:"
echo "   - Prices should now display in Naira"
echo "   - Check: http://localhost:3000/api/exchange-rate/current"
echo ""
echo "3. Monitor function:"
echo "   - View logs: https://supabase.com/dashboard/project/vjzsjwwqkykwoxpildqp/functions/update-exchange-rate/logs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
