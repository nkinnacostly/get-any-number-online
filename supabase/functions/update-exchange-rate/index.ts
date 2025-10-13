// Supabase Edge Function: Update Exchange Rate
// Fetches latest USD to NGN rate from ExchangeRate-API and stores in database
// Scheduled to run daily at 12am Nigeria time (11pm UTC)
// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
// Type declarations for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
interface ExchangeRateResponse {
  result: "success" | "error";
  base_code: string;
  target_code: string;
  conversion_rate: number;
  time_last_update_utc: string;
  error_type?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const exchangeRateApiKey = Deno.env.get("EXCHANGERATE_API_KEY");
    // Supabase automatically provides these environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!exchangeRateApiKey) {
      throw new Error("EXCHANGERATE_API_KEY not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch exchange rate from ExchangeRate-API
    console.log("Fetching USD to NGN exchange rate...");
    const apiUrl = `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/pair/USD/NGN`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`ExchangeRate-API returned status ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result === "error") {
      throw new Error(
        `ExchangeRate-API error: ${data.error_type || "Unknown error"}`
      );
    }

    console.log(`Fetched rate: 1 USD = ${data.conversion_rate} NGN`);

    // Deactivate all existing active rates for USD/NGN
    const { error: deactivateError } = await supabase
      .from("exchange_rates")
      .update({ is_active: false })
      .eq("base_currency", "USD")
      .eq("target_currency", "NGN")
      .eq("is_active", true);

    if (deactivateError) {
      console.error("Error deactivating old rates:", deactivateError);
      throw deactivateError;
    }

    // Insert new exchange rate
    const { data: newRate, error: insertError } = await supabase
      .from("exchange_rates")
      .insert({
        base_currency: data.base_code,
        target_currency: data.target_code,
        rate: data.conversion_rate,
        is_active: true,
        source: "exchangerate-api",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting new rate:", insertError);
      throw insertError;
    }

    console.log("Successfully stored new exchange rate:", newRate);

    // Update all cached service prices with new rate
    const { data: servicePrices, error: fetchError } = await supabase
      .from("service_pricing")
      .select("*");

    if (fetchError) {
      console.error("Error fetching service prices:", fetchError);
    } else if (servicePrices && servicePrices.length > 0) {
      console.log(`Updating ${servicePrices.length} cached service prices...`);

      for (const service of servicePrices) {
        const usdWithMarkup =
          service.original_usd_price * (1 + service.markup_percentage / 100);
        const newNgnPrice =
          Math.round(usdWithMarkup * data.conversion_rate * 100) / 100;

        const { error: updateError } = await supabase
          .from("service_pricing")
          .update({
            final_ngn_price: newNgnPrice,
            exchange_rate_used: data.conversion_rate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", service.id);

        if (updateError) {
          console.error(
            `Error updating service ${service.service_name}:`,
            updateError
          );
        }
      }

      console.log("Successfully updated all service prices");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Exchange rate updated successfully",
        rate: {
          base_currency: data.base_code,
          target_currency: data.target_code,
          rate: data.conversion_rate,
          timestamp: data.time_last_update_utc,
        },
        services_updated: servicePrices?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-exchange-rate function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
