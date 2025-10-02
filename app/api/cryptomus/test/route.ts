import { NextRequest, NextResponse } from "next/server";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency } = body;

    // Test with minimal required fields
    const testPaymentData = {
      amount: amount.toString(),
      currency: "USD",
      order_id: `test_${Date.now()}`,
      url_return: "https://getanynumberonline.com/wallet",
      url_callback: "https://getanynumberonline.com/api/cryptomus/webhook",
      to_currency: currency,
      customer_email: "test@example.com",
    };

    console.log(
      "Testing Cryptomus API with minimal data:",
      JSON.stringify(testPaymentData, null, 2)
    );

    const result = await cryptomusAPI.createPayment(testPaymentData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Test payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
