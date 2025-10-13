/**
 * Cron Job: Update Exchange Rate
 *
 * This endpoint is called by Vercel Cron to update exchange rates daily
 * Schedule: 0 23 * * * (11pm UTC = 12am Nigeria time)
 *
 * Security: Protected by CRON_SECRET environment variable
 */

import { NextResponse } from "next/server";
import { exchangeRateAPI } from "@/services/exchange-rate-api";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow requests from Vercel Cron or with valid secret
    const isVercelCron = request.headers
      .get("user-agent")
      ?.includes("vercel-cron");
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidSecret) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting scheduled exchange rate update...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch latest rate from ExchangeRate-API
    const rateData = await exchangeRateAPI.fetchUSDtoNGN();

    console.log("Fetched rate:", rateData);

    // Deactivate all existing active rates for USD/NGN
    const { error: deactivateError } = await supabase
      .from("exchange_rates")
      .update({ is_active: false })
      .eq("base_currency", "USD")
      .eq("target_currency", "NGN")
      .eq("is_active", true);

    if (deactivateError) {
      console.error("Error deactivating old rates:", deactivateError);
      throw new Error("Failed to deactivate old rates");
    }

    // Insert new exchange rate
    const { data: newRate, error: insertError } = await supabase
      .from("exchange_rates")
      .insert({
        base_currency: rateData.baseCurrency,
        target_currency: rateData.targetCurrency,
        rate: rateData.rate,
        is_active: true,
        source: rateData.source,
        created_at: rateData.timestamp.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting new rate:", insertError);
      throw new Error("Failed to insert new rate");
    }

    console.log("Successfully stored new exchange rate:", newRate);

    // Update all cached service prices with new rate
    const { data: servicePrices, error: fetchError } = await supabase
      .from("service_pricing")
      .select("*");

    let servicesUpdated = 0;

    if (!fetchError && servicePrices && servicePrices.length > 0) {
      console.log(`Updating ${servicePrices.length} cached service prices...`);

      for (const service of servicePrices) {
        const usdWithMarkup =
          service.original_usd_price * (1 + service.markup_percentage / 100);
        const newNgnPrice =
          Math.round(usdWithMarkup * rateData.rate * 100) / 100;

        const { error: updateError } = await supabase
          .from("service_pricing")
          .update({
            final_ngn_price: newNgnPrice,
            exchange_rate_used: rateData.rate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", service.id);

        if (!updateError) {
          servicesUpdated++;
        } else {
          console.error(
            `Error updating service ${service.service_name}:`,
            updateError
          );
        }
      }

      console.log(`Successfully updated ${servicesUpdated} service prices`);
    }

    return NextResponse.json({
      success: true,
      message: "Exchange rate updated successfully via cron",
      timestamp: new Date().toISOString(),
      rate: {
        baseCurrency: rateData.baseCurrency,
        targetCurrency: rateData.targetCurrency,
        rate: rateData.rate,
        source: rateData.source,
      },
      servicesUpdated,
    });
  } catch (error: any) {
    console.error("Error in cron job:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update exchange rate",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow POST method as well for manual testing
export async function POST(request: Request) {
  return GET(request);
}
