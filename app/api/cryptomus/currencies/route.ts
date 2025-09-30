import { NextRequest, NextResponse } from "next/server";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function GET(request: NextRequest) {
  try {
    const result = await cryptomusAPI.getCurrencies();

    if (result.state === 0) {
      return NextResponse.json({
        success: true,
        data: result.result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to get currencies" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Get currencies error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
