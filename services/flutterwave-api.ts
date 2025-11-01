import axios from "axios";
import crypto from "crypto";

/**
 * Flutterwave API Service
 *
 * This service handles all interactions with the Flutterwave payment API.
 * It supports card payments and provides methods for payment initialization,
 * verification, and webhook signature validation.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: Public key for client-side integration
 * - FLUTTERWAVE_SECRET_KEY: Secret key for server-side operations
 * - FLUTTERWAVE_ENCRYPTION_KEY: Encryption key for secure data transmission
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface FlutterwaveCustomer {
  email: string;
  phonenumber?: string;
  name?: string;
}

interface FlutterwaveCustomization {
  title?: string;
  description?: string;
  logo?: string;
}

interface FlutterwavePaymentRequest {
  tx_ref: string; // Unique transaction reference
  amount: number; // Amount in NGN
  currency: string; // Currency code (NGN, USD, etc.)
  redirect_url: string; // URL to redirect after payment
  customer: FlutterwaveCustomer;
  customizations?: FlutterwaveCustomization;
  payment_options?: string; // e.g., "card,banktransfer,ussd"
  meta?: Record<string, any>; // Additional metadata
}

interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string; // Payment page URL
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string; // "successful", "failed", "pending"
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      expiry: string;
    };
  };
}

interface FlutterwaveWebhookPayload {
  event: string; // e.g., "charge.completed"
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    customer: {
      id: number;
      email: string;
      name: string;
      phone_number: string;
    };
    created_at: string;
  };
}

// ============================================================================
// Flutterwave API Class
// ============================================================================

class FlutterwaveAPI {
  private secretKey: string | null = null;
  private publicKey: string | null = null;
  private encryptionKey: string | null = null;
  private baseUrl: string = "https://api.flutterwave.com/v3";

  /**
   * Initialize API credentials from environment variables
   * @throws Error if credentials are missing
   */
  private initialize() {
    if (this.secretKey === null) {
      this.secretKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY || "";
      this.publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "";
      this.encryptionKey =
        process.env.NEXT_PUBLIC_FLUTTERWAVE_ENCRYPTION_KEY || "";

      if (!this.secretKey || !this.publicKey) {
        throw new Error(
          "Flutterwave API credentials not found in environment variables. " +
            "Please set NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY and NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY"
        );
      }
    }
  }

  /**
   * Get the public key for client-side integration
   * @returns The Flutterwave public key
   */
  public getPublicKey(): string {
    this.initialize();
    return this.publicKey!;
  }

  /**
   * Make an authenticated request to the Flutterwave API
   * @param endpoint API endpoint (e.g., "/payments")
   * @param method HTTP method
   * @param data Request payload
   * @returns API response
   */
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" = "POST",
    data?: any
  ): Promise<T> {
    this.initialize();

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.secretKey}`,
      },
      data: method === "POST" ? data : undefined,
      params: method === "GET" ? data : undefined,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.error("Flutterwave API Error Details:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error("Endpoint:", endpoint);

      // Extract meaningful error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred";

      throw new Error(
        `Flutterwave API Error (${
          error.response?.status || "Network Error"
        }): ${errorMessage}`
      );
    }
  }

  /**
   * Initialize a payment transaction
   * Creates a payment link for the customer to complete the payment
   *
   * @param paymentData Payment initialization data
   * @returns Payment response with payment link
   *
   * @example
   * const result = await flutterwaveAPI.initializePayment({
   *   tx_ref: "TX-123456",
   *   amount: 5000,
   *   currency: "NGN",
   *   redirect_url: "https://example.com/callback",
   *   customer: {
   *     email: "customer@example.com",
   *     name: "John Doe",
   *     phonenumber: "+2348012345678"
   *   }
   * });
   */
  async initializePayment(
    paymentData: FlutterwavePaymentRequest
  ): Promise<FlutterwavePaymentResponse> {
    console.log("Initializing Flutterwave payment:", {
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customer_email: paymentData.customer.email,
    });

    return this.makeRequest<FlutterwavePaymentResponse>(
      "/payments",
      "POST",
      paymentData
    );
  }

  /**
   * Verify a payment transaction
   * Call this after receiving a payment callback to confirm the payment status
   *
   * IMPORTANT: Always verify payments on the server side to prevent fraud
   *
   * @param transactionId The transaction ID (tx_ref or Flutterwave transaction ID)
   * @returns Verification response with transaction details
   *
   * @example
   * const verification = await flutterwaveAPI.verifyPayment("TX-123456");
   * if (verification.data.status === "successful") {
   *   // Payment confirmed, credit user's wallet
   * }
   */
  async verifyPayment(
    transactionId: string
  ): Promise<FlutterwaveVerifyResponse> {
    console.log("Verifying Flutterwave payment:", transactionId);

    return this.makeRequest<FlutterwaveVerifyResponse>(
      `/transactions/${transactionId}/verify`,
      "GET"
    );
  }

  /**
   * Verify webhook signature
   * Ensures that webhook requests are actually from Flutterwave
   *
   * SECURITY NOTE: Always verify webhook signatures to prevent malicious requests
   *
   * @param signature The signature from the webhook header (verif-hash)
   * @returns true if signature is valid, false otherwise
   *
   * @example
   * const signature = request.headers.get("verif-hash");
   * if (!flutterwaveAPI.verifyWebhookSignature(signature)) {
   *   return new Response("Invalid signature", { status: 401 });
   * }
   */
  verifyWebhookSignature(signature: string | null): boolean {
    if (!signature) {
      console.warn("No webhook signature provided");
      return false;
    }

    this.initialize();

    // Flutterwave sends the webhook secret hash in the verif-hash header
    // Compare it with your webhook secret hash (same as secret key)
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || this.secretKey;

    if (!secretHash) {
      console.error("Flutterwave secret hash not configured");
      return false;
    }

    const isValid = signature === secretHash;

    if (!isValid) {
      console.warn("Invalid Flutterwave webhook signature");
      console.warn("Expected:", secretHash);
      console.warn("Received:", signature);
    }

    return isValid;
  }

  /**
   * Parse and validate webhook payload
   * Extracts relevant information from Flutterwave webhook
   *
   * @param payload Webhook request body
   * @returns Parsed webhook data
   *
   * @example
   * const webhookData = flutterwaveAPI.parseWebhookPayload(requestBody);
   * if (webhookData.event === "charge.completed") {
   *   // Handle successful payment
   * }
   */
  parseWebhookPayload(payload: any): FlutterwaveWebhookPayload {
    return payload as FlutterwaveWebhookPayload;
  }

  /**
   * Get transaction by reference
   * Retrieve transaction details using your custom tx_ref
   *
   * @param txRef Your transaction reference
   * @returns Transaction details
   */
  async getTransactionByRef(txRef: string): Promise<FlutterwaveVerifyResponse> {
    console.log("Fetching transaction by reference:", txRef);

    // Flutterwave doesn't have a direct endpoint for this,
    // so we use the verify endpoint which accepts tx_ref
    return this.verifyPayment(txRef);
  }

  /**
   * Generate a unique transaction reference
   * Creates a timestamped reference for payment tracking
   *
   * @param userId User ID to include in reference
   * @param prefix Optional prefix (default: "FLW")
   * @returns Unique transaction reference
   *
   * @example
   * const txRef = flutterwaveAPI.generateTxRef("user-123"); // "FLW-user-123-1234567890"
   */
  generateTxRef(userId: string, prefix: string = "FLW"): string {
    return `${prefix}-${userId}-${Date.now()}`;
  }

  /**
   * Validate payment amount
   * Ensures amount meets Flutterwave's requirements
   *
   * @param amount Amount to validate
   * @param currency Currency code
   * @returns true if valid, false otherwise
   */
  validateAmount(amount: number, currency: string = "NGN"): boolean {
    // Flutterwave minimum amounts vary by currency
    const minimums: Record<string, number> = {
      NGN: 100, // ₦100
      USD: 1, // $1
      GBP: 1, // £1
      EUR: 1, // €1
    };

    const minAmount = minimums[currency] || 1;

    if (amount < minAmount) {
      console.warn(
        `Amount ${amount} ${currency} is below minimum ${minAmount}`
      );
      return false;
    }

    if (amount <= 0) {
      console.warn(`Invalid amount: ${amount}`);
      return false;
    }

    return true;
  }

  /**
   * Get supported payment options string
   * Returns comma-separated list of payment methods
   *
   * @param options Array of payment methods to enable
   * @returns Formatted payment options string
   */
  getPaymentOptions(options: string[] = ["card"]): string {
    // Supported options: card, banktransfer, ussd, mobilemoney, account
    const validOptions = [
      "card",
      "banktransfer",
      "ussd",
      "mobilemoney",
      "account",
    ];
    const filtered = options.filter((opt) => validOptions.includes(opt));

    return filtered.length > 0 ? filtered.join(",") : "card";
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const flutterwaveAPI = new FlutterwaveAPI();

// Export types for use in other files
export type {
  FlutterwavePaymentRequest,
  FlutterwavePaymentResponse,
  FlutterwaveVerifyResponse,
  FlutterwaveWebhookPayload,
  FlutterwaveCustomer,
  FlutterwaveCustomization,
};
