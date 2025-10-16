// supabase/functions/smspool-proxy/index.ts
// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Type declarations for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)!;
const SMSPOOL_KEY = Deno.env.get("NEXT_PUBLIC_SMSPOOL_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const url = new URL(req.url);
  console.log(`Request: ${req.method} ${url.pathname}`);

  // Extract the path after the function name
  const pathSegments = url.pathname.split("/");
  const functionPath = pathSegments.slice(2).join("/"); // Remove empty string and function name
  console.log(`Function path: /${functionPath}`);

  // route by path: /fetch-services, /fetch-countries, /order, /check
  if (functionPath === "fetch-services" && req.method === "GET") {
    // Get services
    const form = new URLSearchParams();
    form.append("key", SMSPOOL_KEY);

    const res = await fetch("https://api.smspool.net/service/retrieve_all", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    });
  }

  if (functionPath === "fetch-countries" && req.method === "GET") {
    // Get countries
    const form = new URLSearchParams();
    form.append("key", SMSPOOL_KEY);

    const res = await fetch("https://api.smspool.net/country/retrieve_all", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    });
  }

  if (functionPath === "fetch-pricing" && req.method === "POST") {
    // Get pricing information
    const body = await req.json();
    const form = new URLSearchParams();
    form.append("key", SMSPOOL_KEY);

    if (body.country) form.append("country", body.country.toString());
    if (body.service) form.append("service", body.service.toString());
    if (body.pool) form.append("pool", body.pool.toString());
    if (body.max_price) form.append("max_price", body.max_price.toString());

    const res = await fetch("https://api.smspool.net/request/pricing", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    });
  }

  if (functionPath === "order" && req.method === "POST") {
    const body = await req.json();
    // TODO: validate user (check supabase auth header, or pass user id)
    const params = new URLSearchParams();
    params.append("key", SMSPOOL_KEY);
    params.append("country", body.country);
    params.append("service", String(body.service));
    if (body.pool) params.append("pool", body.pool);
    if (body.max_price) params.append("max_price", String(body.max_price));
    if (body.quantity) params.append("quantity", String(body.quantity));

    const res = await fetch("https://api.smspool.net/purchase/sms", {
      method: "POST",
      body: params,
    });
    const json = await res.json();
    console.log("SMS Pool API response:", JSON.stringify(json, null, 2));

    // Check if SMS Pool purchase was successful
    // SMS Pool API returns success: 1 for success, and the number field
    if (!json || json.success !== 1 || !json.number) {
      console.error("SMS Pool purchase failed:", json);

      // Handle specific error types
      if (json.type === "BALANCE_ERROR") {
        return new Response(
          JSON.stringify({
            error:
              "SMS Pool account has insufficient balance. Please contact support to add funds to the SMS Pool account.",
            details: json.message,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: json?.message || "Failed to purchase number from SMS Pool",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate expiry date from SMS Pool response
    let expiryDate = new Date();

    // Check if SMS Pool response contains expiry information
    if (json.expiry || json.expires_at || json.time_left) {
      // If we have a specific expiry time, use it
      if (json.expiry) {
        expiryDate = new Date(json.expiry);
      } else if (json.expires_at) {
        expiryDate = new Date(json.expires_at);
      } else if (json.time_left) {
        // time_left is typically in minutes
        expiryDate = new Date();
        expiryDate.setMinutes(
          expiryDate.getMinutes() + parseInt(json.time_left)
        );
      }
    } else {
      // Fallback: SMS Pool numbers typically last 10 minutes
      expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    }

    console.log("Calculated expiry date:", expiryDate.toISOString());

    // 1) Check user wallet balance before any operations
    console.log("Checking wallet balance for user:", body.user_id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", body.user_id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const currentBalance = profile.wallet_balance || 0;
    // Use user_charged_price from request (this is the marked-up price the user agreed to pay)
    // max_price is what we send to SMS Pool (original price)
    // user_charged_price is what we charge the user (marked-up price for our profit)
    const purchasePrice = body.user_charged_price || body.max_price || 0;
    console.log(
      `Current balance: ${currentBalance}, User charged price: ${purchasePrice}`
    );
    console.log(
      `SMS Pool raw price: ${json?.price}, SMS Pool max_price sent: ${body.max_price}, User charged price: ${purchasePrice}`
    );

    if (currentBalance < purchasePrice) {
      console.log("Insufficient balance");
      return new Response(
        JSON.stringify({ error: "Insufficient wallet balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2) Use database transaction for atomic operations (only after SMS Pool success)
    console.log("Starting database transaction...");
    const { data: transactionData, error: transactionError } =
      await supabase.rpc("purchase_number_transaction", {
        p_user_id: body.user_id,
        p_phone_number: json.number,
        p_country_code: body.country,
        p_service_name: body.service_name || `Service ${body.service}`,
        p_smspool_number_id: json.orderid || json.order || json.id || "",
        p_cost: purchasePrice,
        p_status: "active", // Only successful purchases reach here
        p_expiry_date: expiryDate.toISOString(),
        p_purchase_amount: -purchasePrice, // negative for deduction
        p_description: `SMS number purchase - ${body.country}`,
      });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      return new Response(
        JSON.stringify({ error: "Failed to complete purchase transaction" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("Database transaction completed successfully");

    return new Response(
      JSON.stringify({
        remote: json,
        transaction: transactionData,
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }

  if (functionPath === "status" && req.method === "POST") {
    const { orderid } = await req.json();
    const form = new URLSearchParams();
    form.append("key", SMSPOOL_KEY);
    form.append("orderid", orderid);

    const res = await fetch("https://api.smspool.net/sms/check", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    console.log("SMS status response:", JSON.stringify(json, null, 2));

    return new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    });
  }

  if (functionPath === "check" && req.method === "POST") {
    const { orderid, purchased_number_id } = await req.json();
    const form = new URLSearchParams();
    form.append("key", SMSPOOL_KEY);
    form.append("orderid", orderid);

    const res = await fetch("https://api.smspool.net/sms/check", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    console.log("SMS check response:", JSON.stringify(json, null, 2));

    // if sms arrived (json may contain sms text), store it
    // Status 1 = SMS received, Status 3 = SMS received (different format)
    if (json && (json.status === 1 || json.status === 3) && json.sms) {
      console.log("SMS received, storing message...");
      console.log("SMS data:", JSON.stringify(json.sms, null, 2));
      console.log("Purchased number ID:", purchased_number_id);

      // Handle different SMS response formats
      let messages = [];
      if (Array.isArray(json.sms)) {
        messages = json.sms;
      } else if (json.status === 3 && json.full_sms) {
        // Status 3 format: sms contains code, full_sms contains full message
        messages = [
          {
            text: json.full_sms,
            code: json.sms,
            from: "System",
          },
        ];
      } else {
        messages = [json.sms];
      }

      console.log("Processing messages:", messages.length);

      // Store each message (check for duplicates first)
      for (const sms of messages) {
        try {
          const messageText = sms.text || sms.message || JSON.stringify(sms);
          const sender = sms.from || sms.sender || null;

          // Check if this exact message already exists for this number
          const { data: existingMessage, error: checkError } = await supabase
            .from("received_messages")
            .select("id")
            .eq("number_id", purchased_number_id)
            .eq("message_text", messageText)
            .eq("sender", sender)
            .limit(1);

          if (checkError) {
            console.error("Error checking for duplicate message:", checkError);
            continue; // Skip this message if we can't check for duplicates
          }

          if (existingMessage && existingMessage.length > 0) {
            console.log("Duplicate message found, skipping insertion:", {
              messageText: messageText.substring(0, 50) + "...",
              sender,
              numberId: purchased_number_id,
            });
            continue; // Skip duplicate message
          }

          const messageData = {
            number_id: purchased_number_id,
            sender: sender,
            message_text: messageText,
            receive_date: new Date(),
            is_read: false,
          };

          console.log(
            "Inserting new message data:",
            JSON.stringify(messageData, null, 2)
          );

          const { data, error } = await supabase
            .from("received_messages")
            .insert(messageData);

          if (error) {
            console.error("Error storing message:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
          } else {
            console.log("New message stored successfully:", data);
          }
        } catch (err) {
          console.error("Exception storing message:", err);
        }
      }
    } else {
      console.log("No SMS received or status not 1 or 3");
      console.log("Response status:", json?.status);
      console.log("SMS data:", json?.sms);
      console.log("Full SMS data:", json?.full_sms);
    }

    return new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    });
  }

  // Default response for root path or unknown routes
  if (functionPath === "" || functionPath === "/") {
    return new Response(
      JSON.stringify({
        message: "SMS Pool Proxy Function",
        available_endpoints: [
          "GET /fetch-services",
          "GET /fetch-countries",
          "POST /fetch-pricing",
          "POST /order",
          "POST /check",
        ],
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      error: "Not Found",
      path: url.pathname,
      functionPath: functionPath,
      method: req.method,
      available_endpoints: [
        "GET /fetch-services",
        "GET /fetch-countries",
        "POST /fetch-pricing",
        "POST /order",
        "POST /check",
      ],
    }),
    {
      status: 404,
      headers: { "content-type": "application/json" },
    }
  );
});
