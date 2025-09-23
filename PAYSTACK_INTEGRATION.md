# Paystack Integration Guide

This document explains how the Paystack payment integration has been implemented in the SMS Pool application.

## Overview

The integration allows users to fund their wallet using Paystack's payment gateway, supporting various payment methods including cards, bank transfers, and mobile money.

## Components

### 1. PaystackFunding Component (`components/wallet/paystack-funding.tsx`)

The main component that handles the Paystack payment flow:

- **Features:**

  - Secure payment processing using Paystack
  - Real-time wallet balance updates
  - Transaction history recording
  - Error handling and user feedback
  - Support for metadata (user ID, funding type)

- **Props:**
  - `userEmail`: User's email address
  - `userId`: User's unique identifier
  - `onSuccess`: Callback function when payment succeeds
  - `onError`: Optional callback for error handling

### 2. Updated WalletCard Component

The wallet card now includes the Paystack funding option alongside the existing manual deposit functionality.

### 3. Webhook Handler (`app/api/paystack/webhook/route.ts`)

Handles Paystack webhooks for secure server-side payment verification:

- Processes `charge.success` events
- Updates wallet balances
- Creates transaction records
- Includes signature verification placeholder

## Environment Variables

Make sure these are set in your `.env` file:

```env
NEXT_PUBLIC_PAYSTACK_PUBLICK_KEY=pk_test_your_public_key_here
```

For production, you'll also need:

```env
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
```

## Database Schema

The integration uses the existing database schema:

- **profiles table**: Stores wallet balance
- **transactions table**: Records all payment transactions

## Payment Flow

1. User clicks "Add Funds" button
2. PaystackFunding component opens in a dialog
3. User enters amount (minimum $1.00)
4. Paystack payment modal opens
5. User completes payment
6. On success:
   - Transaction record created
   - Wallet balance updated
   - Success message displayed
7. On failure:
   - Error message displayed
   - No balance changes

## Security Considerations

### Production Checklist

1. **Webhook Signature Verification**: Implement proper signature verification in the webhook handler
2. **HTTPS**: Ensure all communication is over HTTPS
3. **Environment Variables**: Use production keys for live environment
4. **Error Handling**: Implement comprehensive error logging
5. **Rate Limiting**: Consider implementing rate limiting for payment attempts

### Webhook Security

```typescript
// Example signature verification (implement for production)
function verifyPaystackSignature(
  payload: any,
  signature: string | null
): boolean {
  const crypto = require("crypto");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!signature || !secret) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return hash === signature;
}
```

## Testing

### Test Mode

The integration uses Paystack's test mode by default. Test cards:

- **Successful payment**: 4084084084084081
- **Declined payment**: 4084084084084085
- **Insufficient funds**: 4084084084084082

### Test Component

Use the `PaystackTest` component for quick testing:

```tsx
import { PaystackTest } from "@/components/wallet/paystack-test";

// Add to any page for testing
<PaystackTest />;
```

## Error Handling

The integration handles various error scenarios:

- Invalid amounts
- Network failures
- Payment declines
- Database errors
- Missing user data

## Customization

### Styling

The components use Tailwind CSS and can be customized by modifying the classes in the component files.

### Payment Methods

Paystack supports various payment methods automatically:

- Credit/Debit cards
- Bank transfers
- Mobile money
- USSD

### Metadata

Additional metadata can be added to payments:

```typescript
metadata: {
  custom_fields: [
    {
      display_name: "Custom Field",
      variable_name: "custom_field",
      value: "value",
    },
  ];
}
```

## Troubleshooting

### Common Issues

1. **"Public key not configured"**: Check environment variables
2. **Payment not processing**: Verify Paystack account status
3. **Balance not updating**: Check webhook configuration
4. **Transaction not recorded**: Verify database permissions

### Debug Mode

Enable debug logging by adding console.log statements in the PaystackFunding component.

## Support

For Paystack-specific issues:

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)

For application-specific issues, check the application logs and database transactions.
