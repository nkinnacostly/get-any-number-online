"use client";

import { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface PaystackFundingProps {
  userEmail: string;
  userId: string;
  onSuccess: (amount: number) => void;
  onError?: (error: any) => void;
}

export function PaystackFunding({
  userEmail,
  userId,
  onSuccess,
  onError,
}: PaystackFundingProps) {
  const { convertNGNtoUSD } = useExchangeRate();
  const [amount, setAmount] = useState(""); // User inputs NGN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const config = {
    reference: `wallet_funding_${Date.now()}`,
    email: userEmail,
    amount: Math.round(parseFloat(amount) * 100), // Convert to kobo (smallest currency unit)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLICK_KEY || "",
    metadata: {
      custom_fields: [
        {
          display_name: "Funding Type",
          variable_name: "funding_type",
          value: "Wallet Funding",
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: userId,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onPaystackSuccess = async (reference: any) => {
    try {
      console.log("Payment success callback triggered:", reference);
      setLoading(true);
      setError("");

      // Convert NGN to USD for storage
      const ngnAmount = parseFloat(amount);
      const usdAmount = convertNGNtoUSD(ngnAmount);

      // Verify payment with your backend (optional but recommended)
      // For now, we'll proceed with the payment

      // Create transaction record in Supabase (stored in USD)
      console.log("Creating transaction record...");
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: usdAmount, // Store in USD
          description: `Wallet funding via Paystack - ₦${ngnAmount.toFixed(
            2
          )} - Ref: ${reference.reference}`,
          status: "completed",
        });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        throw new Error("Failed to record transaction");
      }
      console.log("Transaction recorded successfully");

      // Update wallet balance
      console.log("Fetching current balance...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error("Failed to fetch current balance");
      }

      const newBalance = (profile.wallet_balance || 0) + usdAmount; // Add USD to balance
      console.log(
        `Updating balance from ${profile.wallet_balance} to ${newBalance}`
      );

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update wallet balance");
      }
      console.log("Balance updated successfully");

      setSuccess(true);
      onSuccess(usdAmount); // Pass USD amount

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
      }, 2000);
    } catch (err: any) {
      console.error("Payment processing error:", err);
      setError(err.message || "Payment processing failed");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const onPaystackClose = () => {
    console.log("Payment closed");
    setError("");
  };

  const handlePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 100) {
      setError("Minimum funding amount is ₦100.00");
      return;
    }

    setError("");
    initializePayment({
      onSuccess: onPaystackSuccess,
      onClose: onPaystackClose,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Fund Wallet with Paystack</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="funding-amount">Amount (NGN)</Label>
          <Input
            id="funding-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            disabled={loading || success}
          />
          <p className="text-sm text-muted-foreground">
            Minimum amount: ₦100.00
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || success || !amount}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Payment Successful
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Fund Wallet - ₦{amount || "0.00"}
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Secure payment powered by Paystack</p>
          <p>• Supports all major cards and bank transfers</p>
          <p>• Funds are added instantly to your wallet</p>
        </div>
      </CardContent>
    </Card>
  );
}
