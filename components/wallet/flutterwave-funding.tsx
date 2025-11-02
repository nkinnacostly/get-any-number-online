"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useExchangeRate } from "@/hooks/useExchangeRate";

// Declare global FlutterwaveCheckout for TypeScript
declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

interface FlutterwaveFundingProps {
  userEmail: string;
  userId: string;
  onSuccess: (amount: number) => void;
  onError?: (error: any) => void;
}

/**
 * Flutterwave Funding Component
 *
 * Uses Flutterwave inline checkout script for seamless payment integration.
 * Opens a modal for payment instead of redirecting to external page.
 *
 * Features:
 * - Card payment (Visa, Mastercard, Verve, etc.)
 * - Bank transfer
 * - USSD payment
 * - Account payment
 * - Automatic conversion from NGN to USD for storage
 * - Real-time payment verification
 * - Modal-based UI (better UX)
 *
 * Flow:
 * 1. User enters amount in NGN
 * 2. Click "Fund Wallet" button
 * 3. Flutterwave modal opens
 * 4. User completes payment in modal
 * 5. Callback fires with payment response
 * 6. Automatic verification and wallet update
 */

export function FlutterwaveFunding({
  userEmail,
  userId,
  onSuccess,
  onError,
}: FlutterwaveFundingProps) {
  const { convertNGNtoUSD, formatNGN } = useExchangeRate();
  const [amount, setAmount] = useState(""); // User inputs NGN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Fetch user name from profile
    fetchUserName();
    // Load Flutterwave script
    loadFlutterwaveScript();
  }, [userId]);

  const fetchUserName = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    } catch (err) {
      console.error("Error fetching user name:", err);
    }
  };

  // Load Flutterwave inline script
  const loadFlutterwaveScript = () => {
    if (typeof window === "undefined") return;

    // Check if script already exists
    if (document.getElementById("flutterwave-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "flutterwave-script";
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => {
      console.log("Flutterwave script loaded");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Flutterwave script");
      setError("Failed to load payment system. Please refresh the page.");
    };
    document.body.appendChild(script);
  };

  // Generate unique transaction reference
  const generateTxRef = () => {
    return `FLW-${userId}-${Date.now()}`;
  };

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment system...</span>
        </CardContent>
      </Card>
    );
  }

  /**
   * Process successful payment
   */
  const handlePaymentSuccess = async (response: any) => {
    setLoading(true);
    setError("");

    try {
      console.log(
        "Payment callback received:",
        JSON.stringify(response, null, 2)
      );

      // Check if payment was successful in the response
      if (response.status !== "successful" && response.status !== "completed") {
        throw new Error(`Payment not successful. Status: ${response.status}`);
      }

      // Use transaction_id for verification (Flutterwave's ID)
      const transactionId =
        response.transaction_id || response.flw_ref || response.tx_ref;

      if (!transactionId) {
        throw new Error("No transaction ID received from Flutterwave");
      }

      console.log("Verifying payment with ID:", transactionId);

      // Small delay to ensure Flutterwave has processed the transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verify payment with backend
      const verifyResponse = await fetch("/api/flutterwave/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          tx_ref: response.tx_ref,
        }),
      });

      const result = await verifyResponse.json();
      console.log("Verification result:", result);

      if (result.success && result.data.status === "successful") {
        setSuccess(true);
        onSuccess(result.data.amount_usd);

        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setAmount("");
        }, 3000);
      } else {
        setError(result.error || "Payment verification failed");
        onError?.(new Error(result.error || "Payment verification failed"));
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate payment using Flutterwave inline checkout
   */
  const handlePayment = () => {
    console.log("Fund Wallet button clicked");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 100) {
      setError("Minimum funding amount is ₦100.00");
      return;
    }

    // Check if public key is configured
    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
    console.log("Public key configured:", publicKey ? "Yes" : "No");

    if (!publicKey) {
      setError("Payment system not configured. Please contact support.");
      console.error("NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is not set");
      return;
    }

    // Check if script is loaded
    console.log("Script loaded:", scriptLoaded);
    console.log("FlutterwaveCheckout available:", !!window.FlutterwaveCheckout);

    if (!scriptLoaded || !window.FlutterwaveCheckout) {
      setError("Payment system not ready. Please refresh the page.");
      return;
    }

    setError("");
    setLoading(true);

    const txRef = generateTxRef();
    console.log("Generated tx_ref:", txRef);

    // Flutterwave configuration
    const config = {
      public_key: publicKey,
      tx_ref: txRef,
      amount: parseFloat(amount),
      currency: "NGN",
      payment_options: "card,banktransfer,ussd,account",
      customer: {
        email: userEmail,
        phone_number: "",
        name: userName || userEmail.split("@")[0],
      },
      customizations: {
        title: "Wallet Funding",
        description: "Add funds to your SMS Pool wallet",
        logo:
          typeof window !== "undefined"
            ? `${window.location.origin}/icon.svg`
            : "",
      },
      meta: {
        user_id: userId, // Critical: This is used by verify endpoint to identify the user
        funding_type: "Wallet Funding",
        customer_email: userEmail, // Backup way to identify user
      },
      callback: (response: any) => {
        console.log("Flutterwave callback:", response);
        handlePaymentSuccess(response);
      },
      onclose: () => {
        console.log("Payment modal closed");
        setLoading(false);
      },
    };

    console.log("Opening Flutterwave modal with config:", {
      tx_ref: config.tx_ref,
      amount: config.amount,
      currency: config.currency,
      user_id: userId,
    });

    // Open Flutterwave payment modal
    try {
      window.FlutterwaveCheckout(config);
    } catch (err: any) {
      console.error("Error opening payment modal:", err);
      setError(
        `Failed to open payment modal: ${err.message || "Unknown error"}`
      );
      setLoading(false);
      onError?.(err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Fund Wallet with Flutterwave</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Indicator (only show if there's an issue) */}
        {!scriptLoaded && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
            <AlertDescription className="text-yellow-800">
              Loading payment system...
            </AlertDescription>
          </Alert>
        )}

        {scriptLoaded &&
          typeof window !== "undefined" &&
          !window.FlutterwaveCheckout && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Payment system failed to load. Please refresh the page.
              </AlertDescription>
            </Alert>
          )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your wallet has been funded.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="flw-funding-amount">Amount (NGN)</Label>
          <Input
            id="flw-funding-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            step="1"
            disabled={loading || success}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Minimum: ₦100.00</span>
            {amount && parseFloat(amount) >= 100 && (
              <span>
                ≈ ${convertNGNtoUSD(parseFloat(amount)).toFixed(2)} USD
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || success || !amount || parseFloat(amount) < 100}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Payment Successful
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Fund Wallet - {amount ? formatNGN(parseFloat(amount)) : "₦0.00"}
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
          <p>• Secure payment powered by Flutterwave</p>
          <p>• Modal opens for seamless payment</p>
          <p>• Supports cards, bank transfer & USSD</p>
          <p>• Funds added instantly upon confirmation</p>
        </div>

        {/* Payment Methods Info */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-primary hover:underline">
            Supported Payment Methods
          </summary>
          <div className="mt-2 space-y-2 text-muted-foreground">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Cards</p>
                <p className="text-xs">Visa, Mastercard, Verve, and more</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-xs font-bold mt-0.5">🏦</span>
              <div>
                <p className="font-medium text-foreground">Bank Transfer</p>
                <p className="text-xs">
                  Direct transfer from your bank account
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-xs font-bold mt-0.5">📱</span>
              <div>
                <p className="font-medium text-foreground">
                  USSD & Mobile Money
                </p>
                <p className="text-xs">Pay using your mobile phone</p>
              </div>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
