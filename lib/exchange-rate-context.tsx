"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  hoursOld: number;
  isStale: boolean;
  createdAt: string;
  isActive: boolean;
}

interface ExchangeRateContextType {
  rate: number | null;
  rateDetails: ExchangeRate | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(
  undefined
);

const DEFAULT_MARKUP = 35;
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes instead of 5

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState<number | null>(null);
  const [rateDetails, setRateDetails] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/exchange-rate/current");

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data = await response.json();

      if (data.success && data.rate) {
        setRate(data.rate.rate);
        setRateDetails(data.rate);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching exchange rate:", err);
      setError(err.message || "Failed to load exchange rate");
      // Fallback rate
      setRate(1550);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchRate();

    // Refresh every 30 minutes (instead of 5)
    const interval = setInterval(fetchRate, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <ExchangeRateContext.Provider
      value={{
        rate,
        rateDetails,
        loading,
        error,
        refetch: fetchRate,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRateContext() {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error(
      "useExchangeRateContext must be used within an ExchangeRateProvider"
    );
  }
  return context;
}

// Helper functions for price conversion and formatting
export function convertUSDtoNGN(
  usdAmount: number,
  rate: number | null,
  markupPercentage: number = DEFAULT_MARKUP
): number {
  if (!rate) return 0;
  const usdWithMarkup = usdAmount * (1 + markupPercentage / 100);
  return Math.round(usdWithMarkup * rate * 100) / 100;
}

export function convertNGNtoUSD(
  ngnAmount: number,
  rate: number | null,
  markupPercentage: number = DEFAULT_MARKUP
): number {
  if (!rate) return 0;
  const usdWithMarkup = ngnAmount / rate;
  const originalUSD = usdWithMarkup / (1 + markupPercentage / 100);
  return Math.round(originalUSD * 100) / 100;
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNGNCompact(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
