import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "";

    // Call Supabase edge function
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SUPABASE_URL
      }/functions/v1/smspool-proxy/fetch-services${
        country ? `?country=${country}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Edge function not found. Please deploy the smspool-proxy function to Supabase first. Status: ${response.status}`
        );
      }
      throw new Error(
        `Edge function responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling fetch-services edge function:", error);
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
