/**
 * ExchangeRate-API Service
 * Fetches USD to NGN exchange rates from exchangerate-api.com
 * Free tier: 1000 requests/month
 */

export interface ExchangeRateResponse {
  result: "success" | "error";
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  error_type?: string;
}

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
}

class ExchangeRateAPIService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://v6.exchangerate-api.com/v6";
  private readonly baseCurrency: string = "USD";
  private readonly targetCurrency: string = "NGN";

  constructor() {
    this.apiKey =
      process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY ||
      process.env.EXCHANGERATE_API_KEY ||
      "";

    if (!this.apiKey) {
      console.warn(
        "ExchangeRate-API key not configured. Set EXCHANGERATE_API_KEY in environment variables."
      );
    }
  }

  /**
   * Fetch current USD to NGN exchange rate
   * API Endpoint: GET /v6/{api_key}/pair/{base}/{target}
   */
  async fetchUSDtoNGN(): Promise<ExchangeRate> {
    if (!this.apiKey) {
      throw new Error("ExchangeRate-API key not configured");
    }

    try {
      const url = `${this.baseUrl}/${this.apiKey}/pair/${this.baseCurrency}/${this.targetCurrency}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();

      if (data.result === "error") {
        throw new Error(
          `ExchangeRate-API error: ${data.error_type || "Unknown error"}`
        );
      }

      return {
        baseCurrency: data.base_code,
        targetCurrency: data.target_code,
        rate: data.conversion_rate,
        timestamp: new Date(data.time_last_update_utc),
        source: "exchangerate-api",
      };
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      throw error;
    }
  }

  /**
   * Fetch exchange rate with fallback to stored rate
   */
  async fetchWithFallback(): Promise<ExchangeRate> {
    try {
      return await this.fetchUSDtoNGN();
    } catch (error) {
      console.error(
        "Failed to fetch from API, attempting to get cached rate:",
        error
      );
      // Return a fallback rate structure - caller should handle getting from DB
      throw error;
    }
  }

  /**
   * Calculate Naira price from USD with markup
   */
  calculateNairaPrice(
    usdPrice: number,
    exchangeRate: number,
    markupPercentage: number = 35
  ): number {
    const priceWithMarkup = usdPrice * (1 + markupPercentage / 100);
    return Math.round(priceWithMarkup * exchangeRate * 100) / 100;
  }

  /**
   * Convert Naira to USD (for reverse calculations)
   */
  convertNairaToUSD(
    nairaAmount: number,
    exchangeRate: number,
    markupPercentage: number = 35
  ): number {
    const markupMultiplier = 1 + markupPercentage / 100;
    return (
      Math.round((nairaAmount / exchangeRate / markupMultiplier) * 100) / 100
    );
  }

  /**
   * Format price for display
   */
  formatNairaPrice(amount: number): string {
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
  formatUSDPrice(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Check if rate is stale (older than 24 hours)
   */
  isRateStale(timestamp: Date): boolean {
    const hoursSinceUpdate =
      (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24;
  }

  /**
   * Get API usage stats (for monitoring the 1000/month limit)
   */
  async getAPIQuota(): Promise<{
    used: number;
    limit: number;
    remaining: number;
  } | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/${this.apiKey}/quota`;
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        used: data.requests_used || 0,
        limit: data.requests_limit || 1000,
        remaining: data.requests_remaining || 0,
      };
    } catch (error) {
      console.error("Error fetching API quota:", error);
      return null;
    }
  }
}

// Export singleton instance
export const exchangeRateAPI = new ExchangeRateAPIService();
export default exchangeRateAPI;
