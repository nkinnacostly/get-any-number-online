"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Plus, CreditCard, History, Coins, Clock, Zap } from "lucide-react";
import { CryptomusFunding } from "./cryptomus-funding";
import { PaystackFunding } from "./paystack-funding";
import { FlutterwaveFunding } from "./flutterwave-funding";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface WalletCardProps {
  balance: number;
  onDeposit: (amount: number) => Promise<void>;
  userEmail?: string;
  userId?: string;
  totalDeposited?: number;
  totalSpent?: number;
  transactionCount?: number;
}

export function WalletCard({
  balance,
  onDeposit,
  userEmail,
  userId,
  totalDeposited = 0,
  totalSpent = 0,
  transactionCount = 0,
}: WalletCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backgroundChecking, setBackgroundChecking] = useState(false);
  const { formatNGN, convertUSDtoNGN } = useExchangeRate();

  // Listen for background checking status
  useEffect(() => {
    const handleBackgroundChecking = (event: any) => {
      setBackgroundChecking(event.detail.checking);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("backgroundChecking", handleBackgroundChecking);
      return () => {
        window.removeEventListener(
          "backgroundChecking",
          handleBackgroundChecking
        );
      };
    }
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onDeposit(amount);
      setDepositAmount("");
    } catch (err) {
      setError("Failed to deposit funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Wallet Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full -translate-x-8 -translate-y-8"></div>
        </div>

        {/* Card Content */}
        <div className="relative z-10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="h-6 w-6" />
                </div>
                <span>Wallet Balance</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {backgroundChecking && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-100 border-blue-300/30"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Checking Payment
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-primary-foreground border-white/30"
                >
                  Active
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Balance Display */}
            <div className="space-y-2">
              <div className="text-5xl font-bold tracking-tight">
                {formatNGN(convertUSDtoNGN(balance))}
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Available for SMS number purchases
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-8 bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30 backdrop-blur-sm"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Fund Your Wallet</DialogTitle>
                    <DialogDescription>
                      Add money to your wallet using Paystack or cryptocurrency
                    </DialogDescription>
                  </DialogHeader>
                  {userEmail && userId ? (
                    <div className="w-full space-y-4">
                      {/* Primary Payment Options */}
                      <div className="space-y-4">
                        {/* Flutterwave - Primary Recommended Option */}
                        <div>
                          <div className="flex items-center justify-center space-x-2 mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-200/50">
                            <Zap className="h-5 w-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">
                              Flutterwave Payment (Fast & Easy)
                            </span>
                          </div>
                          <FlutterwaveFunding
                            userEmail={userEmail}
                            userId={userId}
                            onSuccess={onDeposit}
                          />
                        </div>

                        {/* Paystack - Alternative Card Payment */}
                        <details className="border rounded-lg p-4 bg-green-500/5 border-green-200/50">
                          <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            Alternative: Paystack Payment
                          </summary>
                          <div className="mt-4">
                            <PaystackFunding
                              userEmail={userEmail}
                              userId={userId}
                              onSuccess={onDeposit}
                            />
                          </div>
                        </details>
                      </div>

                      {/* Crypto Funding - Advanced Option */}
                      <details className="border rounded-lg p-4">
                        <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          Advanced: Fund with Cryptocurrency (USD)
                        </summary>
                        <div className="mt-4">
                          <CryptomusFunding
                            userEmail={userEmail}
                            userId={userId}
                            onSuccess={onDeposit}
                          />
                        </div>
                      </details>

                      {/* Payment Methods Info */}
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                        <p className="font-medium text-foreground">💳 Payment Options:</p>
                        <p>• <strong>Flutterwave:</strong> Cards, Bank Transfer, USSD</p>
                        <p>• <strong>Paystack:</strong> Cards & Bank Transfer</p>
                        <p>• <strong>Crypto:</strong> BTC, ETH, USDT, and more</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button
                        onClick={handleDeposit}
                        disabled={loading}
                        className="w-full"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        {loading ? "Processing..." : "Add Funds"}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group hover:shadow-lg transition-all duration-300 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Deposited
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNGN(convertUSDtoNGN(totalDeposited))}
                </p>
                <div className="flex items-center text-green-600 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  <span>
                    +{formatNGN(convertUSDtoNGN(totalDeposited))} total
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNGN(convertUSDtoNGN(totalSpent))}
                </p>
                <div className="flex items-center text-red-600 text-xs">
                  <CreditCard className="h-3 w-3 mr-1" />
                  <span>{formatNGN(convertUSDtoNGN(totalSpent))} total</span>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {transactionCount}
                </p>
                <div className="flex items-center text-primary text-xs">
                  <History className="h-3 w-3 mr-1" />
                  <span>All time</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <History className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
