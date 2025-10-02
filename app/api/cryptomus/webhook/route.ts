import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cryptomusAPI } from "@/services/cryptomus-api";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (recommended for production)
    const signature = request.headers.get("x-cryptomus-signature");

    // Skip signature verification for testing (remove this in production)
    const isTestSignature = signature === "test-signature";
    if (!isTestSignature && !verifyCryptomusSignature(body, signature)) {
      console.error("Invalid Cryptomus webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = body;

    // Handle payment status updates
    if (type === "payment") {
      const {
        uuid,
        order_id,
        amount,
        payment_amount_usd,
        currency,
        additional_data,
        status,
      } = data;

      console.log(
        `Webhook received for payment ${uuid} with status: ${status}`
      );

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

      // Handle successful payments
      if (status === "paid") {
        // Verify payment with Cryptomus API to ensure it's actually paid
        try {
          console.log(`Verifying payment ${uuid} with Cryptomus API...`);
          const paymentResult = await cryptomusAPI.getPaymentInfo(uuid);

          if (paymentResult.state !== 0) {
            console.error("Failed to verify payment with Cryptomus API");
            return NextResponse.json(
              { error: "Failed to verify payment with Cryptomus" },
              { status: 400 }
            );
          }

          const verifiedPayment = paymentResult.result;

          if (verifiedPayment.status !== "paid") {
            console.log(
              `Payment ${uuid} is not actually paid. Status: ${verifiedPayment.status}`
            );
            return NextResponse.json({
              message: `Payment is not paid. Status: ${verifiedPayment.status}`,
            });
          }

          console.log(`Payment ${uuid} verified as paid with Cryptomus API`);

          // Check if this payment has already been processed
          const { data: existingTransaction, error: existingError } =
            await supabaseAdmin
              .from("transactions")
              .select("*")
              .eq("reference_id", uuid)
              .eq("status", "completed")
              .single();

          if (existingTransaction) {
            console.log(`Payment ${uuid} already processed`);
            return NextResponse.json({
              message: "Payment already processed",
              transaction_id: existingTransaction.id,
            });
          }

          // Get current balance
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("wallet_balance")
            .eq("id", userId)
            .single();

          let currentBalance = 0;
          if (profileError) {
            console.log("Profile not found, creating new profile...");
            // Create profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabaseAdmin
              .from("profiles")
              .insert({
                id: userId,
                email: "user@example.com", // Placeholder
                wallet_balance: 0.0,
              })
              .select()
              .single();

            if (createError) {
              console.error("Error creating profile:", createError);
              return NextResponse.json(
                { error: "Failed to create profile" },
                { status: 500 }
              );
            }
            currentBalance = 0;
          } else {
            currentBalance = profile.wallet_balance || 0;
          }

          const amountInDollars = parseFloat(
            verifiedPayment.payment_amount_usd
          );
          const newBalance = currentBalance + amountInDollars;

          // Update wallet balance
          const { error: updateError } = await supabaseAdmin
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

          // Create transaction record
          const { data: newTransaction, error: transactionError } =
            await supabaseAdmin
              .from("transactions")
              .insert({
                user_id: userId,
                type: "deposit",
                amount: amountInDollars,
                description: `Wallet funding via Cryptomus (${verifiedPayment.currency}) - UUID: ${uuid}`,
                status: "completed",
                reference_id: uuid,
              })
              .select()
              .single();

          if (transactionError) {
            console.error("Error creating transaction:", transactionError);
            // Don't fail the whole operation if transaction creation fails
          }

          console.log(
            `Successfully processed Cryptomus payment for user ${userId}: +$${amountInDollars} (${verifiedPayment.currency})`
          );

          return NextResponse.json({
            message: "Payment processed successfully",
            data: {
              uuid: uuid,
              order_id: order_id,
              amount_usd: amountInDollars,
              currency: verifiedPayment.currency,
              user_id: userId,
              previous_balance: currentBalance,
              new_balance: newBalance,
              transaction_id: newTransaction?.id,
            },
          });
        } catch (error) {
          console.error("Error verifying payment with Cryptomus API:", error);
          return NextResponse.json(
            { error: "Failed to verify payment with Cryptomus API" },
            { status: 500 }
          );
        }
      } else {
        // Handle failed payments
        const failedStatuses = [
          "fail",
          "failed",
          "cancel",
          "cancelled",
          "expired",
          "wrong_amount",
          "system_fail",
          "refund_fail",
        ];

        if (failedStatuses.includes(status.toLowerCase())) {
          console.log(`Payment ${uuid} failed with status: ${status}`);

          // You could log this to a database or send notifications here
          // For now, we'll just log it

          return NextResponse.json({
            message: `Payment failed with status: ${status}`,
            data: {
              uuid: uuid,
              order_id: order_id,
              status: status,
              user_id: userId,
            },
          });
        } else {
          console.log(`Payment ${uuid} has status: ${status} (not handled)`);
          return NextResponse.json({
            message: `Payment status: ${status}`,
            data: {
              uuid: uuid,
              order_id: order_id,
              status: status,
              user_id: userId,
            },
          });
        }
      }
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
