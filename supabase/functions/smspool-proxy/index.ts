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

    // Calculate expiry date (typically 10 minutes for SMS numbers)
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    // 1) store purchased number in Supabase
    const insertRes = await supabase.from("purchased_numbers").insert([
      {
        user_id: body.user_id,
        phone_number: json?.number || json?.phone || "",
        country_code: body.country,
        service_name: body.service_name || `Service ${body.service}`,
        smspool_number_id: json?.orderid || json?.order || json?.id || "",
        cost: body.max_price || 0, // Store the marked-up price the user paid
        status: json?.status === 1 ? "active" : "expired",
        expiry_date: expiryDate,
      },
    ]);

    // 2) Check user wallet balance before deduction
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
    // Use max_price from request (this is the marked-up price the user agreed to pay)
    // SMS Pool price is the raw cost, but we charge users the marked-up price
    const purchasePrice = body.max_price || 0;
    console.log(
      `Current balance: ${currentBalance}, Purchase price: ${purchasePrice}`
    );
    console.log(
      `SMS Pool raw price: ${json?.price}, User charged price: ${body.max_price}`
    );

    if (currentBalance < purchasePrice) {
      console.log("Insufficient balance");
      return new Response(
        JSON.stringify({ error: "Insufficient wallet balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3) Update wallet balance
    const newBalance = currentBalance - purchasePrice;
    console.log(
      `Updating wallet balance from ${currentBalance} to ${newBalance}`
    );
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", body.user_id);

    if (updateError) {
      console.error("Wallet update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update wallet balance" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("Wallet balance updated successfully");

    // 4) create transaction record for wallet deduction
    console.log("Creating transaction record...");
    const transactionRes = await supabase.from("transactions").insert([
      {
        user_id: body.user_id,
        type: "purchase",
        amount: -purchasePrice, // negative for deduction
        description: `SMS number purchase - ${body.country}`,
        status: "completed", // Always completed if we reach this point
      },
    ]);

    if (transactionRes.error) {
      console.error("Transaction creation error:", transactionRes.error);
      // Rollback wallet balance if transaction creation fails
      console.log("Rolling back wallet balance...");
      await supabase
        .from("profiles")
        .update({ wallet_balance: currentBalance })
        .eq("id", body.user_id);

      return new Response(
        JSON.stringify({ error: "Failed to record transaction" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("Transaction created successfully");

    return new Response(
      JSON.stringify({
        remote: json,
        purchased_number: insertRes,
        transaction: transactionRes,
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
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

    // if sms arrived (json may contain sms text), store it
    if (json && json.status === 1 && json.sms) {
      // normalize: json.sms might be array or object depending on API
      // store each message
      try {
        await supabase.from("received_messages").insert({
          number_id: purchased_number_id,
          sender: json.sms.from || null,
          message_text: json.sms.text || JSON.stringify(json.sms),
          receive_date: new Date(),
          is_read: false,
        });
      } catch (err) {
        console.error(err);
      }
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
