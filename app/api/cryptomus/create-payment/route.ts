import { NextRequest, NextResponse } from "next/server";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      network,
      order_id,
      customer_email,
      additional_data,
    } = body;

    if (!amount || !currency || !order_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get base URL, fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const paymentData = {
      amount: amount.toString(),
      currency: "USD", // We always charge in USD
      order_id,
      url_return: `${baseUrl}/wallet?payment=success`,
      url_callback: `${baseUrl}/api/cryptomus/webhook`,
      is_payment_multiple: false,
      lifetime: 3600, // 1 hour
      to_currency: currency,
      subtract: 0,
      accuracy_payment_percent: 0,
      additional_data,
      currencies: [{ currency: currency, network: network || "" }],
      customer_email,
    };

    const result = await cryptomusAPI.createPayment(paymentData);

    if (result.state === 0) {
      return NextResponse.json({
        success: true,
        data: result.result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to create payment" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
