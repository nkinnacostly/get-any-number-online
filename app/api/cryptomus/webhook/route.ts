import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (recommended for production)
    const signature = request.headers.get("x-cryptomus-signature");
    if (!verifyCryptomusSignature(body, signature)) {
      console.error("Invalid Cryptomus webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = body;

    // Handle payment status updates
    if (type === "payment" && data.status === "paid") {
      const {
        uuid,
        order_id,
        amount,
        payment_amount_usd,
        currency,
        additional_data,
      } = data;

      // Extract user ID from additional_data
      let userId;
      try {
        const additionalData = JSON.parse(additional_data || "{}");
        userId = additionalData.user_id;
      } catch (error) {
        console.error("Error parsing additional_data:", error);
      }

      if (!userId) {
        console.error("No user ID found in payment metadata");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      // Convert amount to dollars (Cryptomus provides payment_amount_usd)
      const amountInDollars = parseFloat(payment_amount_usd);

      // Find the pending transaction by order_id
      console.log(`Looking for pending transaction with order_id: ${order_id}`);
      const { data: pendingTransaction, error: findError } = await supabase
        .from("transactions")
        .select("*")
        .eq("reference_id", order_id)
        .eq("status", "pending")
        .eq("user_id", userId)
        .single();

      if (findError || !pendingTransaction) {
        console.error("Pending transaction not found:", findError);
        return NextResponse.json(
          { error: "Pending transaction not found" },
          { status: 404 }
        );
      }

      // Update the pending transaction to completed
      console.log("Updating pending transaction to completed...");
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          description: `Wallet funding via Cryptomus (${currency}) - UUID: ${uuid}`,
          reference_id: uuid, // Update with actual payment UUID
        })
        .eq("id", pendingTransaction.id);

      if (updateTxError) {
        console.error("Error updating transaction:", updateTxError);
        return NextResponse.json(
          { error: "Failed to update transaction" },
          { status: 500 }
        );
      }

      // Update wallet balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      const newBalance = (profile.wallet_balance || 0) + amountInDollars;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating wallet balance:", updateError);
        return NextResponse.json(
          { error: "Failed to update balance" },
          { status: 500 }
        );
      }

      console.log(
        `Successfully processed Cryptomus payment for user ${userId}: $${amountInDollars} (${currency})`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cryptomus webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Function to verify Cryptomus webhook signature
function verifyCryptomusSignature(
  payload: any,
  signature: string | null
): boolean {
  if (!signature) {
    console.warn("No signature provided in webhook");
    return false; // Require signature for security
  }

  const apiKey = process.env.NEXT_PUBLIC_CRYPTOMUS_API_KEY;
  if (!apiKey) {
    console.error("Cryptomus API key not found");
    return false;
  }

  try {
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHash("md5")
      .update(Buffer.from(payloadString, "utf8").toString("base64") + apiKey)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}
