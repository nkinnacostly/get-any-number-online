"use client";

import {
  useExchangeRateContext,
  convertUSDtoNGN as contextConvertUSDtoNGN,
  convertNGNtoUSD as contextConvertNGNtoUSD,
  formatNGN as contextFormatNGN,
  formatUSD as contextFormatUSD,
  formatNGNCompact as contextFormatNGNCompact,
} from "@/lib/exchange-rate-context";

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  hoursOld: number;
  isStale: boolean;
  createdAt: string;
  isActive: boolean;
}

const DEFAULT_MARKUP = 35; // 35% markup

export function useExchangeRate() {
  const { rate, rateDetails, loading, error, refetch } =
    useExchangeRateContext();

  const convertUSDtoNGN = (
    usdAmount: number,
    markupPercentage: number = DEFAULT_MARKUP
  ): number => {
    return contextConvertUSDtoNGN(usdAmount, rate, markupPercentage);
  };

  const convertNGNtoUSD = (
    ngnAmount: number,
    markupPercentage: number = DEFAULT_MARKUP
  ): number => {
    return contextConvertNGNtoUSD(ngnAmount, rate, markupPercentage);
  };

  const formatNGN = (amount: number): string => {
    return contextFormatNGN(amount);
  };

  const formatUSD = (amount: number): string => {
    return contextFormatUSD(amount);
  };

  const formatNGNCompact = (amount: number): string => {
    return contextFormatNGNCompact(amount);
  };

  return {
    rate,
    rateDetails,
    loading,
    error,
    convertUSDtoNGN,
    convertNGNtoUSD,
    formatNGN,
    formatUSD,
    formatNGNCompact,
    refetch,
  };
}
