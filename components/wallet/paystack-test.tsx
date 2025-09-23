"use client";

import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export function PaystackTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const config = {
    reference: `test_${Date.now()}`,
    email: "test@example.com",
    amount: 100, // 1 USD in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLICK_KEY || "",
    metadata: {
      custom_fields: [
        {
          display_name: "Test Payment",
          variable_name: "test",
          value: "true",
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    setResult({ success: true, reference });
    setError("");
  };

  const onClose = () => {
    setError("Payment was closed");
    setResult(null);
  };

  const handleTestPayment = () => {
    setError("");
    setResult(null);
    initializePayment(onSuccess, onClose);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Paystack Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result?.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Test payment successful! Reference: {result.reference.reference}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Test Paystack integration with a $1.00 payment</p>
          <p>This is a test payment and won't charge your card</p>
        </div>

        <Button onClick={handleTestPayment} className="w-full">
          Test Paystack Payment ($1.00)
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Public Key: {config.publicKey ? "✓ Configured" : "✗ Missing"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
