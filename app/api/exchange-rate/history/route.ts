import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET /api/exchange-rate/history
 * Returns historical exchange rates
 * Query params:
 * - limit: number of records to return (default: 30, max: 100)
 * - days: filter to last N days
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const daysParam = searchParams.get("days");

    const limit = Math.min(parseInt(limitParam || "30"), 100);
    const days = daysParam ? parseInt(daysParam) : null;

    let query = supabase
      .from("exchange_rates")
      .select("*")
      .eq("base_currency", "USD")
      .eq("target_currency", "NGN")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by days if specified
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.gte("created_at", cutoffDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching exchange rate history:", error);
      return NextResponse.json(
        { error: "Failed to fetch exchange rate history" },
        { status: 500 }
      );
    }

    const rates = data.map((rate) => ({
      id: rate.id,
      baseCurrency: rate.base_currency,
      targetCurrency: rate.target_currency,
      rate: parseFloat(rate.rate),
      source: rate.source,
      createdAt: rate.created_at,
      isActive: rate.is_active,
    }));

    // Calculate statistics
    const rateValues = rates.map((r) => r.rate);
    const avgRate =
      rateValues.length > 0
        ? rateValues.reduce((a, b) => a + b, 0) / rateValues.length
        : 0;
    const minRate = rateValues.length > 0 ? Math.min(...rateValues) : 0;
    const maxRate = rateValues.length > 0 ? Math.max(...rateValues) : 0;
    const currentRate = rates.length > 0 ? rates[0].rate : 0;

    return NextResponse.json({
      success: true,
      rates,
      statistics: {
        count: rates.length,
        average: Math.round(avgRate * 100) / 100,
        minimum: minRate,
        maximum: maxRate,
        current: currentRate,
        change:
          rates.length > 1
            ? Math.round((currentRate - rates[1].rate) * 100) / 100
            : 0,
        changePercent:
          rates.length > 1
            ? Math.round(
                ((currentRate - rates[1].rate) / rates[1].rate) * 10000
              ) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error in /api/exchange-rate/history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
