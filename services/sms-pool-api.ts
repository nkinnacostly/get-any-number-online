// SMS Pool API Service
const SMSPOOL_BASE_URL = "https://api.smspool.net";

export interface SMSPoolResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  country: string;
  price: number;
  available: boolean;
}

export interface PurchaseResponse {
  orderid: string;
  number: string;
  country: string;
  service: string;
  price: number;
  expires_at: string;
}

export interface MessageResponse {
  orderid: string;
  number: string;
  message: string;
  sender: string;
  timestamp: string;
}

export interface PricingInfo {
  service: number;
  service_name: string;
  country: number;
  country_name: string;
  short_name: string;
  pool: number;
  price: string;
}

export class SMSPoolService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get available services
  async getAvailableServices(): Promise<SMSPoolResponse> {
    try {
      const response = await fetch("/api/smspool-proxy/fetch-services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get available countries
  async getAvailableCountries(): Promise<SMSPoolResponse> {
    try {
      const response = await fetch("/api/smspool-proxy/countries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Purchase a number
  async purchaseNumber(
    service: string,
    country: string,
    options: {
      pool?: string;
      max_price?: number;
      pricing_option?: number;
      quantity?: number;
      areacode?: string[];
      exclude?: boolean;
      create_token?: boolean;
      user_id?: string;
      service_name?: string;
    } = {}
  ): Promise<SMSPoolResponse> {
    try {
      const requestBody = {
        country,
        service,
        activation_type: "SMS",
        ...options,
      };

      const response = await fetch("/api/smspool-proxy/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Check for messages
  async checkMessages(
    orderId: string,
    purchasedNumberId?: string
  ): Promise<SMSPoolResponse> {
    try {
      const requestBody = {
        orderid: orderId,
        ...(purchasedNumberId && { purchased_number_id: purchasedNumberId }),
      };

      const response = await fetch("/api/smspool-proxy/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Cancel number
  async cancelNumber(orderId: string): Promise<SMSPoolResponse> {
    try {
      const formData = new FormData();
      formData.append("key", this.apiKey);
      formData.append("orderid", orderId);

      const response = await fetch(`${SMSPOOL_BASE_URL}/sms/cancel`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get account balance
  async getBalance(): Promise<SMSPoolResponse> {
    try {
      const formData = new FormData();
      formData.append("key", this.apiKey);

      const response = await fetch(`${SMSPOOL_BASE_URL}/request/balance`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get order history
  async getOrderHistory(): Promise<SMSPoolResponse> {
    try {
      const response = await fetch(
        `${SMSPOOL_BASE_URL}/orders?key=${this.apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get pricing information
  async getPricing(
    options: {
      country?: number;
      service?: number;
      pool?: number;
      max_price?: number;
    } = {}
  ): Promise<SMSPoolResponse> {
    try {
      const response = await fetch("/api/smspool-proxy/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
