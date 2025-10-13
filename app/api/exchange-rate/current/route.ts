import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET /api/exchange-rate/current
 * Returns the current active USD to NGN exchange rate
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("base_currency", "USD")
      .eq("target_currency", "NGN")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching current exchange rate:", error);
      return NextResponse.json(
        { error: "Failed to fetch exchange rate" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No active exchange rate found" },
        { status: 404 }
      );
    }

    // Calculate age in hours
    const createdAt = new Date(data.created_at);
    const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    const isStale = hoursOld > 24;

    return NextResponse.json({
      success: true,
      rate: {
        id: data.id,
        baseCurrency: data.base_currency,
        targetCurrency: data.target_currency,
        rate: parseFloat(data.rate),
        source: data.source,
        createdAt: data.created_at,
        isActive: data.is_active,
        hoursOld: Math.round(hoursOld * 10) / 10,
        isStale,
      },
    });
  } catch (error) {
    console.error("Error in /api/exchange-rate/current:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
