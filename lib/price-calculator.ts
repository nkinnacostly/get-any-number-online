/**
 * Price Calculator Utility
 * Handles USD to NGN conversions with markup for SMSPool services
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PriceConversion {
  originalUSD: number;
  markupPercentage: number;
  exchangeRate: number;
  finalNGN: number;
  usdWithMarkup: number;
}

export interface CachedServicePrice {
  id: string;
  serviceName: string;
  originalUsdPrice: number;
  markupPercentage: number;
  finalNgnPrice: number;
  exchangeRateUsed: number;
  updatedAt: string;
}

export class PriceCalculator {
  private static DEFAULT_MARKUP = 35; // 35% markup
  private static DEFAULT_RATE = 1550; // Fallback rate if DB unavailable

  /**
   * Get the latest active exchange rate from database
   */
  static async getLatestExchangeRate(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("base_currency", "USD")
        .eq("target_currency", "NGN")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching exchange rate:", error);
        return this.DEFAULT_RATE;
      }

      return data?.rate || this.DEFAULT_RATE;
    } catch (error) {
      console.error("Failed to get exchange rate:", error);
      return this.DEFAULT_RATE;
    }
  }

  /**
   * Convert USD to NGN with markup
   */
  static async convertUSDtoNGN(
    usdAmount: number,
    markupPercentage: number = this.DEFAULT_MARKUP
  ): Promise<PriceConversion> {
    const exchangeRate = await this.getLatestExchangeRate();
    const usdWithMarkup = usdAmount * (1 + markupPercentage / 100);
    const finalNGN = Math.round(usdWithMarkup * exchangeRate * 100) / 100;

    return {
      originalUSD: usdAmount,
      markupPercentage,
      exchangeRate,
      finalNGN,
      usdWithMarkup,
    };
  }

  /**
   * Convert NGN back to USD (without markup)
   */
  static async convertNGNtoUSD(
    ngnAmount: number,
    markupPercentage: number = this.DEFAULT_MARKUP
  ): Promise<number> {
    const exchangeRate = await this.getLatestExchangeRate();
    const usdWithMarkup = ngnAmount / exchangeRate;
    const originalUSD = usdWithMarkup / (1 + markupPercentage / 100);

    return Math.round(originalUSD * 100) / 100;
  }

  /**
   * Get cached service price from database
   */
  static async getCachedServicePrice(
    serviceName: string
  ): Promise<CachedServicePrice | null> {
    try {
      const { data, error } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("service_name", serviceName)
        .single();

      if (error) {
        console.error("Error fetching cached service price:", error);
        return null;
      }

      return data
        ? {
            id: data.id,
            serviceName: data.service_name,
            originalUsdPrice: parseFloat(data.original_usd_price),
            markupPercentage: parseFloat(data.markup_percentage),
            finalNgnPrice: parseFloat(data.final_ngn_price),
            exchangeRateUsed: parseFloat(data.exchange_rate_used),
            updatedAt: data.updated_at,
          }
        : null;
    } catch (error) {
      console.error("Failed to get cached service price:", error);
      return null;
    }
  }

  /**
   * Update or insert service pricing in cache
   */
  static async updateServicePrice(
    serviceName: string,
    originalUsdPrice: number,
    markupPercentage: number = this.DEFAULT_MARKUP
  ): Promise<CachedServicePrice | null> {
    try {
      const conversion = await this.convertUSDtoNGN(
        originalUsdPrice,
        markupPercentage
      );

      const { data, error } = await supabase
        .from("service_pricing")
        .upsert(
          {
            service_name: serviceName,
            original_usd_price: originalUsdPrice,
            markup_percentage: markupPercentage,
            final_ngn_price: conversion.finalNGN,
            exchange_rate_used: conversion.exchangeRate,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "service_name",
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Error updating service price:", error);
        return null;
      }

      return data
        ? {
            id: data.id,
            serviceName: data.service_name,
            originalUsdPrice: parseFloat(data.original_usd_price),
            markupPercentage: parseFloat(data.markup_percentage),
            finalNgnPrice: parseFloat(data.final_ngn_price),
            exchangeRateUsed: parseFloat(data.exchange_rate_used),
            updatedAt: data.updated_at,
          }
        : null;
    } catch (error) {
      console.error("Failed to update service price:", error);
      return null;
    }
  }

  /**
   * Format Naira price for display
   */
  static formatNGN(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format USD price for display
   */
  static formatUSD(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format compact Naira (e.g., ₦1.5K, ₦2.3M)
   */
  static formatNGNCompact(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  /**
   * Check if cached price needs update (older than 24 hours)
   */
  static isPriceStale(updatedAt: string): boolean {
    const updateTime = new Date(updatedAt).getTime();
    const hoursSinceUpdate = (Date.now() - updateTime) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24;
  }

  /**
   * Batch convert multiple USD prices to NGN
   */
  static async batchConvertUSDtoNGN(
    prices: Array<{ name: string; usd: number }>,
    markupPercentage: number = this.DEFAULT_MARKUP
  ): Promise<Array<{ name: string; usd: number; ngn: number }>> {
    const exchangeRate = await this.getLatestExchangeRate();

    return prices.map(({ name, usd }) => {
      const usdWithMarkup = usd * (1 + markupPercentage / 100);
      const ngn = Math.round(usdWithMarkup * exchangeRate * 100) / 100;

      return { name, usd, ngn };
    });
  }

  /**
   * Calculate percentage saved with current markup
   */
  static calculateMarkupAmount(
    usdPrice: number,
    markupPercentage: number = this.DEFAULT_MARKUP
  ): number {
    return Math.round(usdPrice * (markupPercentage / 100) * 100) / 100;
  }
}

// Export convenience functions
export const getLatestRate = () => PriceCalculator.getLatestExchangeRate();
export const convertToNGN = (usd: number, markup?: number) =>
  PriceCalculator.convertUSDtoNGN(usd, markup);
export const convertToUSD = (ngn: number, markup?: number) =>
  PriceCalculator.convertNGNtoUSD(ngn, markup);
export const formatNGN = (amount: number) => PriceCalculator.formatNGN(amount);
export const formatUSD = (amount: number) => PriceCalculator.formatUSD(amount);
export const formatNGNCompact = (amount: number) =>
  PriceCalculator.formatNGNCompact(amount);

export default PriceCalculator;
