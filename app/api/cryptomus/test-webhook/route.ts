import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, user_id, amount_usd, currency, order_id } = body;

    if (!uuid || !user_id || !amount_usd) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: uuid, user_id, amount_usd",
        },
        { status: 400 }
      );
    }

    // Simulate Cryptomus webhook payload
    const webhookPayload = {
      type: "payment",
      data: {
        uuid: uuid,
        order_id: order_id || `wallet_funding_${user_id}_${Date.now()}`,
        amount: amount_usd,
        payment_amount_usd: amount_usd,
        currency: currency || "USD",
        status: "paid",
        additional_data: JSON.stringify({
          user_id: user_id,
          funding_type: "Wallet Funding",
        }),
      },
    };

    console.log(
      "Simulating webhook call with payload:",
      JSON.stringify(webhookPayload, null, 2)
    );

    // Call the webhook endpoint locally
    const webhookUrl = "http://localhost:3000/api/cryptomus/webhook";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cryptomus-signature": "test-signature", // This will bypass signature verification for testing
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Webhook simulation completed",
      webhook_response: result,
      webhook_url: webhookUrl,
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
