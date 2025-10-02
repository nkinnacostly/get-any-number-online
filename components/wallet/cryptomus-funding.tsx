"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Clock,
  QrCode,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CryptomusFundingProps {
  userEmail: string;
  userId: string;
  onSuccess: (amount: number) => void;
  onError?: (error: any) => void;
}

interface Cryptocurrency {
  currency: string;
  network: string;
  name: string;
  icon: string;
}

export function CryptomusFunding({
  userEmail,
  userId,
  onSuccess,
  onError,
}: CryptomusFundingProps) {
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [currencies, setCurrencies] = useState<Cryptocurrency[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [backgroundChecking, setBackgroundChecking] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");

  // Popular cryptocurrencies for quick selection
  const popularCurrencies = [
    { currency: "USDT", network: "", name: "Tether (USDT)", icon: "₮" },
    { currency: "BTC", network: "", name: "Bitcoin", icon: "₿" },
    { currency: "ETH", network: "", name: "Ethereum", icon: "Ξ" },
    { currency: "USDC", network: "", name: "USD Coin", icon: "$" },
    { currency: "BNB", network: "", name: "Binance Coin", icon: "B" },
    { currency: "LTC", network: "", name: "Litecoin", icon: "Ł" },
    { currency: "DOGE", network: "", name: "Dogecoin", icon: "Ð" },
  ];

  useEffect(() => {
    setIsClient(true);
    setCurrencies(popularCurrencies);
  }, []);

  // Poll payment status every 10 seconds
  useEffect(() => {
    if (
      paymentData?.uuid &&
      paymentStatus !== "paid" &&
      !paymentCompleted &&
      !paymentFailed
    ) {
      const interval = setInterval(async () => {
        await checkPaymentStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [paymentData, paymentStatus, paymentCompleted, paymentFailed]);

  // Background checking when modal is closed but payment is still pending
  useEffect(() => {
    if (
      paymentData?.uuid &&
      paymentStatus !== "paid" &&
      !paymentCompleted &&
      !paymentFailed &&
      backgroundChecking
    ) {
      const interval = setInterval(async () => {
        await checkPaymentStatus();
      }, 15000); // Check every 15 seconds in background

      return () => clearInterval(interval);
    }
  }, [
    paymentData,
    paymentStatus,
    paymentCompleted,
    paymentFailed,
    backgroundChecking,
  ]);

  // Helper function to check if payment status indicates failure
  const isFailedStatus = (status: string) => {
    const failedStatuses = [
      "fail",
      "failed",
      "cancel",
      "cancelled",
      "expired",
      "wrong_amount",
      "system_fail",
      "refund_fail",
    ];
    return failedStatuses.includes(status.toLowerCase());
  };

  // Helper function to get failure reason message
  const getFailureReason = (status: string) => {
    switch (status.toLowerCase()) {
      case "fail":
      case "failed":
        return "Payment failed. Please try again.";
      case "cancel":
      case "cancelled":
        return "Payment was cancelled.";
      case "expired":
        return "Payment expired. Please create a new payment.";
      case "wrong_amount":
        return "Incorrect payment amount received.";
      case "system_fail":
        return "System error occurred. Please contact support.";
      case "refund_fail":
        return "Refund processing failed.";
      default:
        return `Payment failed with status: ${status}`;
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.uuid) return;

    try {
      setCheckingStatus(true);

      // First, try the payment info endpoint (more reliable)
      const response = await fetch("/api/cryptomus/payment-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid: paymentData.uuid }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setPaymentStatus(result.data.status);

        if (result.data.status === "paid") {
          // Use the verify-and-update endpoint to ensure wallet is updated
          await verifyAndUpdatePayment(result.data);
        } else if (isFailedStatus(result.data.status)) {
          // Handle failed payment
          await handlePaymentFailure(result.data);
        }
      } else {
        // Fallback: try the status endpoint
        console.log("Payment info failed, trying status endpoint...");
        const statusResponse = await fetch("/api/cryptomus/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uuid: paymentData.uuid }),
        });

        const statusResult = await statusResponse.json();

        if (statusResult.success && statusResult.data) {
          setPaymentStatus(statusResult.data.status);

          if (statusResult.data.status === "paid") {
            await verifyAndUpdatePayment(statusResult.data);
          } else if (isFailedStatus(statusResult.data.status)) {
            // Handle failed payment
            await handlePaymentFailure(statusResult.data);
          }
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePaymentFailure = async (paymentInfo: any) => {
    try {
      console.log(`Payment failed with status: ${paymentInfo.status}`);

      setPaymentFailed(true);
      setFailureReason(getFailureReason(paymentInfo.status));
      setBackgroundChecking(false);
      setCheckingStatus(false);

      // Dispatch events to notify other components
      if (typeof window !== "undefined") {
        // Stop background checking
        window.dispatchEvent(
          new CustomEvent("backgroundChecking", {
            detail: { checking: false },
          })
        );

        // Notify payment failure
        window.dispatchEvent(
          new CustomEvent("paymentFailed", {
            detail: {
              uuid: paymentInfo.uuid,
              status: paymentInfo.status,
              reason: getFailureReason(paymentInfo.status),
              user_id: userId,
            },
          })
        );
      }

      // Call onError if provided
      onError?.(new Error(getFailureReason(paymentInfo.status)));
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  };

  const verifyAndUpdatePayment = async (paymentInfo: any) => {
    try {
      console.log("Verifying and updating payment...");

      const response = await fetch("/api/cryptomus/verify-payment-by-uuid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: paymentInfo.uuid,
          user_id: userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.data.already_processed) {
          console.log("Payment already processed, updating UI...");
        } else {
          console.log("Payment verified and wallet updated successfully");
        }

        setPaymentCompleted(true);
        setSuccess(true);
        setBackgroundChecking(false);
        onSuccess(
          parseFloat(paymentInfo.payment_amount_usd || paymentInfo.amount)
        );

        // Dispatch events for background checking and payment completion
        if (typeof window !== "undefined") {
          // Stop background checking
          window.dispatchEvent(
            new CustomEvent("backgroundChecking", {
              detail: { checking: false },
            })
          );

          // Notify payment completion
          window.dispatchEvent(
            new CustomEvent("paymentCompleted", {
              detail: {
                uuid: paymentInfo.uuid,
                amount: parseFloat(
                  paymentInfo.payment_amount_usd || paymentInfo.amount
                ),
                currency: paymentInfo.currency,
                user_id: userId,
              },
            })
          );
        }

        // Reset form after 5 seconds (longer to show success message)
        setTimeout(() => {
          setSuccess(false);
          setAmount("");
          setSelectedCurrency("");
          setPaymentData(null);
          setPaymentStatus("");
          setPaymentCompleted(false);
          setPaymentFailed(false);
          setFailureReason("");
        }, 5000);
      } else {
        console.error("Payment verification failed:", result.error);
        setError(result.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setError("Failed to verify payment");
    }
  };

  const handlePaymentSuccess = async (paymentInfo: any) => {
    try {
      setLoading(true);
      setError("");

      // Find and update the pending transaction
      console.log("Finding pending transaction...");
      const { data: pendingTransaction, error: findError } = await supabase
        .from("transactions")
        .select("*")
        .eq("reference_id", paymentInfo.order_id)
        .eq("status", "pending")
        .single();

      if (findError || !pendingTransaction) {
        console.error("Pending transaction not found:", findError);
        throw new Error("Pending transaction not found");
      }

      // Update transaction status to completed
      console.log("Updating transaction status to completed...");
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          description: `Wallet funding via Cryptomus (${paymentInfo.currency}) - UUID: ${paymentInfo.uuid}`,
          reference_id: paymentInfo.uuid, // Update with actual payment UUID
        })
        .eq("id", pendingTransaction.id);

      if (updateTxError) {
        console.error("Transaction update error:", updateTxError);
        throw new Error("Failed to update transaction status");
      }
      console.log("Transaction status updated successfully");

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

      const newBalance = (profile.wallet_balance || 0) + parseFloat(amount);
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
      onSuccess(parseFloat(amount));

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        setSelectedCurrency("");
        setPaymentData(null);
        setPaymentStatus("");
      }, 3000);
    } catch (err: any) {
      console.error("Payment processing error:", err);
      setError(err.message || "Payment processing failed");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 1) {
      setError("Minimum funding amount is $1.00");
      return;
    }

    if (!selectedCurrency) {
      setError("Please select a cryptocurrency");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderId = `wallet_funding_${userId}_${Date.now()}`;

      // First, create a pending transaction record
      console.log("Creating pending transaction record...");
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: parseFloat(amount),
          description: `Wallet funding via Cryptomus (${selectedCurrency}) - Pending`,
          status: "pending",
          reference_id: orderId,
        });

      if (transactionError) {
        console.error("Transaction creation error:", transactionError);
        throw new Error("Failed to create transaction record");
      }
      console.log("Pending transaction created successfully");

      const response = await fetch("/api/cryptomus/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: selectedCurrency,
          network: "", // Let Cryptomus handle network selection
          order_id: orderId,
          customer_email: userEmail,
          additional_data: JSON.stringify({
            user_id: userId,
            funding_type: "Wallet Funding",
          }),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentData(result.data);
        setPaymentStatus(result.data.status);
        setRedirecting(true);

        // Automatically redirect to Cryptomus payment page
        if (result.data.url) {
          // Open in new tab for better UX
          window.open(result.data.url, "_blank");

          // Show success message briefly
          setTimeout(() => {
            setRedirecting(false);
            setSuccess(true);
          }, 2000);
        }
      } else {
        // If payment creation fails, delete the pending transaction
        await supabase
          .from("transactions")
          .delete()
          .eq("reference_id", orderId);

        throw new Error(result.error || "Failed to create payment");
      }
    } catch (err: any) {
      console.error("Payment creation error:", err);
      setError(err.message || "Failed to create payment");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "waiting":
        return "text-yellow-600";
      case "confirm_check":
        return "text-blue-600";
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirm_check":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5" />
          <span>Fund Wallet with Cryptocurrency</span>
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

        {backgroundChecking && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Payment is being checked in the background. You'll be notified
              when it's completed.
            </AlertDescription>
          </Alert>
        )}

        {paymentFailed && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{failureReason}</AlertDescription>
          </Alert>
        )}

        {redirecting && (
          <Alert className="border-blue-200 bg-blue-50">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Payment created! Opening Cryptomus payment page...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!paymentData ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="funding-amount">Amount (USD)</Label>
              <Input
                id="funding-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                disabled={loading || success || redirecting}
              />
              <p className="text-sm text-muted-foreground">
                Minimum amount: $1.00
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto-currency">Cryptocurrency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
                disabled={loading || success || redirecting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((crypto) => (
                    <SelectItem key={crypto.currency} value={crypto.currency}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{crypto.icon}</span>
                        <span>{crypto.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={createPayment}
              disabled={
                loading ||
                success ||
                redirecting ||
                !amount ||
                !selectedCurrency
              }
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Payment...
                </>
              ) : redirecting ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Opening Payment Page...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Create Payment - ${amount || "0.00"}
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getStatusIcon(paymentStatus)}
                <span
                  className={`font-medium ${getStatusColor(paymentStatus)}`}
                >
                  {paymentStatus.charAt(0).toUpperCase() +
                    paymentStatus.slice(1).replace("_", " ")}
                </span>
                {checkingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {paymentData.payment_amount && (
                <p className="text-sm text-muted-foreground">
                  Pay: {paymentData.payment_amount} {paymentData.currency}
                </p>
              )}
            </div>

            {paymentData.address && (
              <div className="space-y-2">
                <Label>Payment Address</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={paymentData.address}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {paymentData.url && (
              <div className="space-y-2">
                <Button
                  onClick={() => window.open(paymentData.url, "_blank")}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Payment Page Again
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  If the payment page didn't open automatically, click the
                  button above
                </p>
              </div>
            )}

            {paymentData.expired_at && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Expires:{" "}
                  {new Date(paymentData.expired_at * 1000).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setPaymentData(null);
                  setPaymentStatus("");
                  setAmount("");
                  setSelectedCurrency("");
                  setRedirecting(false);
                  setSuccess(false);
                  setPaymentCompleted(false);
                  setBackgroundChecking(false);
                  setPaymentFailed(false);
                  setFailureReason("");
                }}
                variant="outline"
                className="w-full"
              >
                Create New Payment
              </Button>

              {paymentData?.uuid &&
                paymentStatus !== "paid" &&
                !paymentCompleted &&
                !paymentFailed && (
                  <Button
                    onClick={() => {
                      setBackgroundChecking(true);
                      // Dispatch event to notify wallet card
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("backgroundChecking", {
                            detail: { checking: true },
                          })
                        );
                      }
                      // Modal will close but background checking continues
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Close Modal & Check in Background
                  </Button>
                )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Secure cryptocurrency payments</p>
          <p>• Instant wallet funding upon confirmation</p>
          <p>• Support for major cryptocurrencies</p>
        </div>
      </CardContent>
    </Card>
  );
}
