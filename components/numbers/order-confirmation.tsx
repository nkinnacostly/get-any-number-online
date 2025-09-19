"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, DollarSign, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  icon?: string;
}

interface PricingOption {
  pool: number;
  price: number;
  originalPrice: number;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  price: number;
  pricingOptions?: PricingOption[];
}

interface OrderConfirmationProps {
  selectedService: Service;
  selectedCountry: Country;
  onBack: () => void;
  onConfirm: () => Promise<void>;
  onPricingOptionSelect?: (option: PricingOption) => void;
  selectedPricingOption?: PricingOption | null;
  loading?: boolean;
}

export function OrderConfirmation({
  selectedService,
  selectedCountry,
  onBack,
  onConfirm,
  onPricingOptionSelect,
  selectedPricingOption,
  loading = false,
}: OrderConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      setError("");
      await onConfirm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Order Summary Card Skeleton */}
        <div className="border-2 border-border bg-muted rounded-xl p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Button Skeleton */}
        <div className="w-full h-12 bg-muted rounded-xl"></div>

        {/* Disclaimer Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Order Summary Card */}
      <Card className="border-2 border-border bg-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg text-card-foreground">
            Order Summary
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Service */}
          <div className="flex items-center justify-between p-4 bg-card border border-primary/20 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {selectedService.icon ||
                  selectedService.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-card-foreground">
                {selectedService.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              Change
            </Button>
          </div>

          {/* Selected Country */}
          <div className="flex items-center justify-between p-4 bg-card border border-accent rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm">
                {selectedCountry.flag}
              </div>
              <div>
                <div className="font-medium text-card-foreground">
                  {selectedCountry.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedCountry.code}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-accent hover:bg-accent"
            >
              Change
            </Button>
          </div>

          {/* Pricing Options */}
          {selectedCountry.pricingOptions &&
            selectedCountry.pricingOptions.length > 1 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-card-foreground mb-2">
                  Choose Pricing Option:
                </div>
                {selectedCountry.pricingOptions.map((option, index) => (
                  <div
                    key={option.pool}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPricingOption?.pool === option.pool
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-border"
                    }`}
                    onClick={() => onPricingOptionSelect?.(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedPricingOption?.pool === option.pool
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {selectedPricingOption?.pool === option.pool && (
                            <div className="w-full h-full rounded-full bg-background scale-50"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">
                            Pool {option.pool}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ${option.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Validity */}
          <div className="flex items-center space-x-3 p-4 bg-card border border-border rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-medium text-card-foreground">
              Up to 20 minutes
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-card-foreground">
                Total Cost
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">
              $
              {(selectedPricingOption?.price || selectedCountry.price).toFixed(
                2
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Order Button */}
      <Button
        onClick={handleConfirm}
        disabled={isConfirming}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
      >
        {isConfirming ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            <span>Ordering...</span>
          </div>
        ) : (
          "Order Number"
        )}
      </Button>

      {/* Disclaimer */}
      <div className="text-center space-y-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <div className="flex items-center justify-center space-x-1">
          <span className="text-primary">✓</span>
          <span className="font-medium">
            Only successful activations are paid
          </span>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <span className="text-primary">✓</span>
          <span className="font-medium">No message - No payment</span>
        </div>
      </div>
    </div>
  );
}
