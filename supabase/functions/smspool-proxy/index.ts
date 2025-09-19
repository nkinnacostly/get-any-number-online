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
        cost: json?.price || 0,
        status: json?.status === 1 ? "active" : "expired",
        expiry_date: expiryDate,
      },
    ]);

    // 2) create transaction record for wallet deduction
    const transactionRes = await supabase.from("transactions").insert([
      {
        user_id: body.user_id,
        type: "purchase",
        amount: -(json?.price || 0), // negative for deduction
        description: `SMS number purchase - ${body.country}`,
        reference_id: insertRes.data?.[0]?.id,
        status: json?.status === 1 ? "completed" : "pending",
      },
    ]);

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
