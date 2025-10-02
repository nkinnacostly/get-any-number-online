import axios from "axios";
import crypto from "crypto";

interface CryptomusPaymentRequest {
  amount: string;
  currency: string;
  order_id: string;
  url_return?: string;
  url_callback?: string;
  is_payment_multiple?: boolean;
  lifetime?: number;
  to_currency?: string;
  subtract?: number;
  accuracy_payment_percent?: number;
  additional_data?: string;
  currencies?: { currency: string; network: string }[];
  except_currencies?: string[];
  network?: string;
  address?: string;
  is_refresh?: boolean;
  customer_email?: string;
  customer_phone?: string;
}

interface CryptomusPaymentResponse {
  state: number;
  result: {
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount: string;
    payment_amount_usd: string;
    currency: string;
    merchant_amount: string;
    network: string;
    address: string;
    from: string;
    txid: string;
    payment_status: string;
    url: string;
    expired_at: number;
    status: string;
    is_final: boolean;
    additional_data: string;
    created_at: string;
    updated_at: string;
  };
}

interface CryptomusPaymentInfo {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  currency: string;
  merchant_amount: string;
  network: string;
  address: string;
  from: string;
  txid: string;
  payment_status: string;
  url: string;
  expired_at: number;
  status: string;
  is_final: boolean;
  additional_data: string;
  created_at: string;
  updated_at: string;
}

class CryptomusAPI {
  private apiKey: string | null = null;
  private merchantId: string | null = null;
  private baseUrl: string = "https://api.cryptomus.com/v1";

  private initialize() {
    if (this.apiKey === null || this.merchantId === null) {
      this.apiKey = process.env.NEXT_PUBLIC_CRYPTOMUS_API_KEY || "";
      this.merchantId = process.env.NEXT_PUBLIC_CRYPTOMUS_MERCHANT_ID || "";

      if (!this.apiKey || !this.merchantId) {
        throw new Error(
          "Cryptomus API credentials not found in environment variables"
        );
      }
    }
  }

  private generateSignature(data: string): string {
    this.initialize();
    const sign = crypto
      .createHash("md5")
      .update(Buffer.from(data, "utf8").toString("base64") + this.apiKey!)
      .digest("hex");
    return sign;
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    method: "GET" | "POST" = "POST"
  ): Promise<T> {
    this.initialize();
    const dataString = JSON.stringify(data);
    const signature = this.generateSignature(dataString);

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        merchant: this.merchantId!,
        sign: signature,
      },
      data: method === "POST" ? data : undefined,
      params: method === "GET" ? data : undefined,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error("Cryptomus API Error Details:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error(
        "Response Data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error("Request Config:", JSON.stringify(config, null, 2));

      throw new Error(
        `Cryptomus API Error: ${error.response?.status} - ${
          JSON.stringify(error.response?.data) || error.message
        }`
      );
    }
  }

  async createPayment(
    paymentData: CryptomusPaymentRequest
  ): Promise<CryptomusPaymentResponse> {
    return this.makeRequest<CryptomusPaymentResponse>("/payment", paymentData);
  }

  async getPaymentInfo(
    uuid: string
  ): Promise<{ state: number; result: CryptomusPaymentInfo }> {
    return this.makeRequest<{ state: number; result: CryptomusPaymentInfo }>(
      "/payment/info",
      { uuid },
      "POST"
    );
  }

  async getPaymentStatus(
    uuid: string
  ): Promise<{ state: number; result: CryptomusPaymentInfo }> {
    return this.makeRequest<{ state: number; result: CryptomusPaymentInfo }>(
      "/payment/status",
      { uuid },
      "GET"
    );
  }

  async getCurrencies(): Promise<{ state: number; result: any[] }> {
    return this.makeRequest<{ state: number; result: any[] }>(
      "/payment/currencies",
      {},
      "POST"
    );
  }

  async getRates(): Promise<{ state: number; result: any }> {
    return this.makeRequest<{ state: number; result: any }>(
      "/payment/rates",
      {},
      "POST"
    );
  }
}

export const cryptomusAPI = new CryptomusAPI();
export type {
  CryptomusPaymentRequest,
  CryptomusPaymentResponse,
  CryptomusPaymentInfo,
};
