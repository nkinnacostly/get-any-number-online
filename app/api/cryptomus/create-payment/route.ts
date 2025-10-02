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

    // Create minimal payment data first to test
    const paymentData = {
      amount: amount.toString(),
      currency: "USD", // We always charge in USD
      order_id,
      url_return: `${baseUrl}/wallet?payment=success`,
      url_callback: `${baseUrl}/api/cryptomus/webhook`,
      to_currency: currency,
      additional_data,
      customer_email,
    };

    console.log(
      "Creating payment with data:",
      JSON.stringify(paymentData, null, 2)
    );
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
