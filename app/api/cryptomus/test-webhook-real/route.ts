import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, order_id, user_id, amount_usd, currency } = body;

    if (!uuid && !order_id) {
      return NextResponse.json(
        { error: "Either uuid or order_id is required" },
        { status: 400 }
      );
    }

    console.log("Testing webhook with Cryptomus API...");

    // Use Cryptomus test webhook endpoint
    const testWebhookData = {
      url_callback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cryptomus/webhook`,
      currency: currency || "LTC",
      network: "ltc",
      uuid: uuid,
      order_id: order_id,
      status: "paid"
    };

    console.log("Test webhook data:", testWebhookData);

    // Generate proper signature
    const apiKey = process.env.NEXT_PUBLIC_CRYPTOMUS_API_KEY;
    const merchantId = process.env.NEXT_PUBLIC_CRYPTOMUS_MERCHANT_ID;
    
    if (!apiKey || !merchantId) {
      return NextResponse.json(
        { error: "Cryptomus credentials not found" },
        { status: 500 }
      );
    }

    const dataString = JSON.stringify(testWebhookData);
    const signature = crypto
      .createHash("md5")
      .update(Buffer.from(dataString, "utf8").toString("base64") + apiKey)
      .digest("hex");

    console.log("Generated signature:", signature);

    // Call Cryptomus test webhook endpoint
    const response = await fetch("https://api.cryptomus.com/v1/test-webhook/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "merchant": merchantId,
        "sign": signature
      },
      body: dataString
    });

    const result = await response.json();
    console.log("Cryptomus test webhook response:", result);

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cryptomus test webhook failed: ${response.status}`,
          details: result
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully",
      data: result
    });

  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}