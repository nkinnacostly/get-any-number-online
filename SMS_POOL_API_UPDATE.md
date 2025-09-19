# SMS Pool API Integration Update

This document outlines the updates made to integrate properly with the SMS Pool API based on their official documentation.

## Key Changes Made

### 1. Updated API Endpoints

**Before:**

- Used incorrect endpoint paths
- Mixed GET/POST methods incorrectly
- Used `api_key` parameter instead of `key`

**After:**

- Correct endpoint paths according to SMS Pool documentation
- Proper HTTP methods (POST for purchase/check/cancel, GET for services/balance)
- Uses `key` parameter as specified in documentation

### 2. Updated Service Class (`services/sms-pool-api.ts`)

#### New Features:

- **TypeScript Interfaces**: Added proper type definitions for responses
- **Error Handling**: Comprehensive error handling with structured responses
- **Form Data**: Purchase requests now use FormData as required by SMS Pool API
- **Additional Methods**: Added balance checking and order history

#### Updated Methods:

1. **`getAvailableServices()`**

   - Endpoint: `POST /request/services`
   - Method: POST with FormData
   - Returns: Available services with pricing and availability

2. **`purchaseNumber(service, country, options)`**

   - Endpoint: `POST /request/sms`
   - Method: POST with FormData
   - Parameters: All SMS Pool purchase parameters supported
   - Returns: Order details including orderid

3. **`checkMessages(orderId)`**

   - Endpoint: `POST /request/sms/check`
   - Method: POST with FormData
   - Returns: Messages received for the order

4. **`cancelNumber(orderId)`**

   - Endpoint: `POST /request/sms/cancel`
   - Method: POST with FormData
   - Returns: Cancellation confirmation

5. **`getBalance()`** (NEW)

   - Endpoint: `POST /request/balance`
   - Method: POST with FormData
   - Returns: Account balance information

6. **`getOrderHistory()`** (NEW)
   - Endpoint: `GET /orders?key={apiKey}`
   - Returns: Complete order history

### 3. Updated Supabase Edge Function (`supabase/functions/smspool-proxy/index.ts`)

#### New Features:

- **Proxy Architecture**: Acts as a secure proxy between frontend and SMS Pool API
- **Multiple Endpoints**: Handles all SMS Pool API endpoints
- **CORS Support**: Proper CORS headers for frontend integration
- **Error Handling**: Comprehensive error handling and logging

#### Available Proxy Endpoints:

- `GET /smspool-proxy/services` - Get available services
- `POST /smspool-proxy/purchase` - Purchase a number
- `POST /smspool-proxy/check` - Check for messages
- `POST /smspool-proxy/cancel` - Cancel a number
- `GET /smspool-proxy/balance` - Get account balance
- `GET /smspool-proxy/orders` - Get order history

## Environment Variables Required

Add these to your Supabase Edge Function environment:

```bash
SMSPOOL_API_KEY=your-32-character-api-key-here
```

## Usage Examples

### Frontend Usage (via Proxy)

```typescript
// Purchase a number
const response = await fetch("/api/smspool-proxy/purchase", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    country: "US",
    service: "1",
    pricing_option: 0,
    max_price: 0.5,
  }),
});

const result = await response.json();
if (result.orderid) {
  console.log("Number purchased:", result.number);
}
```

### Direct API Usage

```typescript
import { SMSPoolService } from "./services/sms-pool-api";

const smsPool = new SMSPoolService("your-api-key");

// Purchase a number
const result = await smsPool.purchaseNumber("1", "US", {
  pricing_option: 0,
  max_price: 0.5,
});

if (result.success) {
  console.log("Order ID:", result.data.orderid);
}
```

## SMS Pool API Parameters

### Purchase Parameters:

- `key`: Your API key (required)
- `country`: Country code (e.g., "US", "UK") (required)
- `service`: Service ID (required)
- `activation_type`: "SMS" (required)
- `pool`: Pool ID (optional)
- `max_price`: Maximum price per number (optional)
- `pricing_option`: 0 for cheapest, 1 for highest success rate (optional)
- `quantity`: Number of numbers to order (optional)
- `areacode`: Array of area codes (optional)
- `exclude`: Boolean to exclude listed area codes (optional)
- `create_token`: Boolean to create public token link (optional)

### Response Format:

All methods return a structured response:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

## Testing

1. **Set up environment variables** in Supabase
2. **Deploy the Edge Function** to Supabase
3. **Test endpoints** using the provided examples
4. **Verify API responses** match expected format

## Security Notes

- API key is stored securely in Supabase environment variables
- Frontend never directly accesses SMS Pool API
- All requests go through the secure proxy function
- CORS is properly configured for your domain

## Next Steps

1. Update your frontend components to use the new API structure
2. Implement proper error handling in UI components
3. Add loading states for API calls
4. Implement real-time message checking (polling or webhooks)
5. Add balance display in your wallet component

## Troubleshooting

### Common Issues:

1. **API Key**: Ensure your SMS Pool API key is valid and has sufficient balance
2. **CORS**: Make sure your domain is allowed in Supabase CORS settings
3. **Rate Limits**: SMS Pool has rate limits, implement proper delays between requests
4. **Error Responses**: Check the `error` field in responses for specific error messages

### Debug Mode:

Enable debug logging in the Edge Function to see detailed request/response information.
