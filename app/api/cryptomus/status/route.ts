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

    const result = await cryptomusAPI.getPaymentStatus(uuid);

    if (result.state === 0) {
      return NextResponse.json({
        success: true,
        data: result.result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to get payment status" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Get payment status error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
