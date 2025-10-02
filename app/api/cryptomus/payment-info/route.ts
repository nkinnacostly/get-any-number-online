import { NextRequest, NextResponse } from "next/server";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid } = body;

    if (!uuid) {
      return NextResponse.json(
        { success: false, error: "Missing payment UUID" },
        { status: 400 }
      );
    }

    console.log(`Getting payment info for UUID: ${uuid}`);

    const result = await cryptomusAPI.getPaymentInfo(uuid);

    if (result.state === 0) {
      return NextResponse.json({
        success: true,
        data: result.result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to get payment info" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Get payment info error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
