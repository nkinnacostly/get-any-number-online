import { NextResponse } from "next/server";
import { exchangeRateAPI } from "@/services/exchange-rate-api";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/exchange-rate/update
 * Manually trigger exchange rate update from ExchangeRate-API
 * This should be admin-protected in production
 */
export async function POST(request: Request) {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll allow any authenticated user to trigger updates

    console.log("Manually triggering exchange rate update...");

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
      message: "Exchange rate updated successfully",
      rate: {
        baseCurrency: rateData.baseCurrency,
        targetCurrency: rateData.targetCurrency,
        rate: rateData.rate,
        timestamp: rateData.timestamp,
        source: rateData.source,
      },
      servicesUpdated,
    });
  } catch (error: any) {
    console.error("Error in /api/exchange-rate/update:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update exchange rate",
      },
      { status: 500 }
    );
  }
}
