# Cryptomus Integration Guide

This document explains how the Cryptomus cryptocurrency payment integration has been implemented in the SMS Pool application.

## Overview

The integration allows users to fund their wallet using Cryptomus's cryptocurrency payment gateway, supporting various cryptocurrencies including Bitcoin, Ethereum, USDT, USDC, and many others.

## Components

### 1. CryptomusAPI Service (`services/cryptomus-api.ts`)

The main service that handles all Cryptomus API interactions:

- **Features:**

  - Secure payment creation using Cryptomus API
  - Payment status checking
  - Currency and rate information
  - Signature verification for webhooks
  - Support for multiple cryptocurrencies and networks

- **Methods:**
  - `createPayment()`: Creates a new cryptocurrency payment
  - `getPaymentInfo()`: Gets detailed payment information
  - `getPaymentStatus()`: Checks current payment status
  - `getCurrencies()`: Lists available cryptocurrencies
  - `getRates()`: Gets current exchange rates

### 2. CryptomusFunding Component (`components/wallet/cryptomus-funding.tsx`)

The main component that handles the cryptocurrency payment flow:

- **Features:**

  - Cryptocurrency selection (USDT, BTC, ETH, USDC, BNB, etc.)
  - Real-time payment status monitoring
  - Automatic wallet balance updates
  - Transaction history recording
  - Error handling and user feedback
  - Support for multiple networks (ERC20, TRC20, BSC, etc.)

- **Props:**
  - `userEmail`: User's email address
  - `userId`: User's unique identifier
  - `onSuccess`: Callback function when payment succeeds
  - `onError`: Optional callback for error handling

### 3. API Routes

#### Create Payment (`app/api/cryptomus/create-payment/route.ts`)

- Creates new cryptocurrency payments
- Handles payment configuration
- Returns payment details including address and QR code

#### Payment Status (`app/api/cryptomus/status/route.ts`)

- Checks payment status
- Used for real-time status updates
- Returns current payment information

#### Webhook Handler (`app/api/cryptomus/webhook/route.ts`)

- Handles Cryptomus webhooks for secure server-side payment verification
- Processes payment status updates
- Updates wallet balances automatically
- Creates transaction records
- Includes signature verification

### 4. Updated WalletCard Component

The wallet card now includes both Paystack and Cryptomus funding options in a tabbed interface:

- **Card/Bank Tab**: Traditional payment methods via Paystack
- **Crypto Tab**: Cryptocurrency payments via Cryptomus

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Cryptomus API Credentials
NEXT_PUBLIC_CRYPTOMUS_API_KEY=your_api_key_here
NEXT_PUBLIC_CRYPTOMUS_MERCHANT_ID=your_merchant_id_here

# App URL for webhooks and redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, make sure to:

1. Use production Cryptomus credentials
2. Set the correct `NEXT_PUBLIC_APP_URL`
3. Configure webhook URLs in your Cryptomus dashboard

## Database Schema

The integration uses the existing database schema:

- **profiles table**: Stores wallet balance
- **transactions table**: Records all payment transactions

## Supported Cryptocurrencies

The integration supports popular cryptocurrencies including:

- **USDT**: Tether (ERC20, TRC20 networks)
- **BTC**: Bitcoin
- **ETH**: Ethereum
- **USDC**: USD Coin (ERC20)
- **BNB**: Binance Coin (BSC network)

Additional cryptocurrencies can be added by updating the `popularCurrencies` array in the CryptomusFunding component.

## Payment Flow

1. User clicks "Add Funds" button
2. User selects "Crypto" tab in the funding dialog
3. User enters amount (minimum $1.00)
4. User selects cryptocurrency and network
5. User clicks "Create Payment"
6. Cryptomus generates payment address and QR code
7. User sends cryptocurrency to the provided address
8. System monitors payment status every 10 seconds
9. On payment confirmation:
   - Transaction record created
   - Wallet balance updated
   - Success notification shown

## Webhook Configuration

Configure the following webhook URL in your Cryptomus dashboard:

```
https://getanynumberonline.com/api/cryptomus/webhook
```

The webhook handles:

- Payment status updates
- Automatic balance updates
- Transaction record creation
- Signature verification

## Security Features

- **Signature Verification**: All webhooks are verified using MD5 signatures
- **Environment Variables**: API keys are stored securely
- **HTTPS Required**: All communications use HTTPS
- **Input Validation**: All inputs are validated and sanitized

## Error Handling

The integration includes comprehensive error handling:

- Network errors
- API errors
- Invalid payment data
- Webhook verification failures
- Database operation failures

## Testing

To test the integration:

1. Set up test environment variables
2. Use Cryptomus test mode
3. Create small test payments
4. Verify webhook processing
5. Check wallet balance updates
6. Review transaction history

## Production Deployment

Before deploying to production:

1. Update environment variables with production credentials
2. Configure production webhook URLs
3. Test with real cryptocurrency payments
4. Monitor webhook processing
5. Set up proper logging and monitoring

## Troubleshooting

Common issues and solutions:

- **Payment not detected**: Check webhook configuration and signature verification
- **Balance not updated**: Verify database permissions and transaction creation
- **API errors**: Check API credentials and rate limits
- **Network issues**: Ensure proper HTTPS configuration

## Support

For issues related to:

- Cryptomus API: Contact Cryptomus support
- Integration bugs: Check application logs and webhook processing
- Database issues: Verify Supabase configuration and permissions
