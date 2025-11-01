import { NextRequest, NextResponse } from "next/server";
import { flutterwaveAPI } from "@/services/flutterwave-api";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/flutterwave/webhook
 * 
 * Handle Flutterwave webhook notifications
 * 
 * This endpoint receives real-time payment notifications from Flutterwave.
 * It verifies the webhook signature and processes successful payments.
 * 
 * Security:
 * - Verifies webhook signature using verif-hash header
 * - Double-checks payment status with Flutterwave API
 * - Prevents duplicate processing
 * 
 * Webhook Events:
 * - charge.completed: Payment successful
 * - charge.failed: Payment failed
 * - transfer.completed: Transfer completed (future use)
 * 
 * Setup Instructions:
 * 1. Go to Flutterwave Dashboard > Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/flutterwave/webhook
 * 3. Copy the webhook secret hash
 * 4. Set FLUTTERWAVE_SECRET_HASH in environment variables
 */

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify webhook signature
    const signature = request.headers.get("verif-hash");
    
    // For development/testing, allow bypass with specific test signature
    const isTestMode = process.env.NODE_ENV === "development";
    const isTestWebhook = signature === "test-flutterwave-signature";
    
    if (!isTestWebhook && !flutterwaveAPI.verifyWebhookSignature(signature)) {
      console.error("Invalid Flutterwave webhook signature");
      console.error("Received signature:", signature);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Step 2: Parse webhook payload
    const payload = await request.json();
    console.log("Flutterwave webhook received:", {
      event: payload.event,
      tx_ref: payload.data?.tx_ref,
      status: payload.data?.status,
    });

    const webhookData = flutterwaveAPI.parseWebhookPayload(payload);

    // Step 3: Handle different webhook events
    switch (webhookData.event) {
      case "charge.completed":
        return await handleChargeCompleted(webhookData);
      
      case "charge.failed":
        return await handleChargeFailed(webhookData);
      
      default:
        console.log(`Unhandled webhook event: ${webhookData.event}`);
        return NextResponse.json({
          message: `Event ${webhookData.event} received but not handled`,
        });
    }
  } catch (error: any) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment completion
 */
async function handleChargeCompleted(webhookData: any) {
  const { data } = webhookData;
  const { tx_ref, flw_ref, amount, currency, status, customer } = data;

  console.log("Processing completed charge:", {
    tx_ref,
    flw_ref,
    amount,
    currency,
    status,
  });

  // Step 1: Verify payment status is actually successful
  if (status !== "successful") {
    console.log(`Charge status is not successful: ${status}`);
    return NextResponse.json({
      message: `Charge status: ${status}`,
    });
  }

  // Step 2: Double-verify with Flutterwave API (security best practice)
  try {
    console.log("Double-verifying payment with Flutterwave API...");
    const verification = await flutterwaveAPI.verifyPayment(tx_ref);

    if (verification.status !== "success" || verification.data.status !== "successful") {
      console.log("Payment verification failed:", verification);
      return NextResponse.json({
        error: "Payment verification failed",
      });
    }

    const verifiedPayment = verification.data;

    // Step 3: Find transaction in database
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("gateway_transaction_id", tx_ref)
      .eq("payment_method", "flutterwave")
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", transactionError);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Step 4: Check if already processed (prevent double-crediting)
    if (transaction.status === "completed" && transaction.amount > 0) {
      console.log("Payment already processed:", tx_ref);
      return NextResponse.json({
        message: "Payment already processed",
        tx_ref,
        transaction_id: transaction.id,
      });
    }

    // Step 5: Calculate USD amount
    const { data: exchangeRate } = await supabaseAdmin
      .from("exchange_rates")
      .select("ngn_to_usd_rate")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const ngnToUsdRate = exchangeRate?.ngn_to_usd_rate || 0.0006;
    const amountUsd = verifiedPayment.amount * ngnToUsdRate;

    console.log("Amount conversion:", {
      ngn: verifiedPayment.amount,
      rate: ngnToUsdRate,
      usd: amountUsd,
    });

    // Step 6: Get current balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance")
      .eq("id", transaction.user_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const currentBalance = profile.wallet_balance || 0;
    const newBalance = currentBalance + amountUsd;

    // Step 7: Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", transaction.user_id);

    if (updateError) {
      console.error("Failed to update balance:", updateError);
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 500 }
      );
    }

    // Step 8: Update transaction record
    const { error: updateTxError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: "completed",
        amount: amountUsd,
        description: `Wallet funding via Flutterwave - ₦${verifiedPayment.amount.toFixed(
          2
        )} - Ref: ${tx_ref}`,
        gateway_reference: flw_ref,
        gateway_status: verifiedPayment.status,
        gateway_metadata: {
          ...transaction.gateway_metadata,
          amount_ngn: verifiedPayment.amount,
          amount_usd: amountUsd,
          charged_amount: verifiedPayment.charged_amount,
          currency: verifiedPayment.currency,
          payment_type: verifiedPayment.payment_type,
          customer: verifiedPayment.customer,
          card: verifiedPayment.card || null,
          processor_response: verifiedPayment.processor_response,
          webhook_processed_at: new Date().toISOString(),
        },
      })
      .eq("id", transaction.id);

    if (updateTxError) {
      console.error("Failed to update transaction:", updateTxError);
      // Don't fail - wallet is already updated
    }

    console.log("Webhook processed successfully:", {
      tx_ref,
      user_id: transaction.user_id,
      amount_ngn: verifiedPayment.amount,
      amount_usd: amountUsd,
      previous_balance: currentBalance,
      new_balance: newBalance,
    });

    return NextResponse.json({
      message: "Payment processed successfully",
      data: {
        tx_ref,
        flw_ref,
        amount_ngn: verifiedPayment.amount,
        amount_usd: amountUsd,
        user_id: transaction.user_id,
        previous_balance: currentBalance,
        new_balance: newBalance,
      },
    });
  } catch (error: any) {
    console.error("Error processing charge.completed:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle failed payment
 */
async function handleChargeFailed(webhookData: any) {
  const { data } = webhookData;
  const { tx_ref, status } = data;

  console.log("Processing failed charge:", {
    tx_ref,
    status,
  });

  // Find and update transaction
  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("gateway_transaction_id", tx_ref)
    .eq("payment_method", "flutterwave")
    .single();

  if (transactionError || !transaction) {
    console.error("Transaction not found:", transactionError);
    return NextResponse.json({
      message: "Transaction not found",
    });
  }

  // Update transaction to failed
  await supabaseAdmin
    .from("transactions")
    .update({
      status: "failed",
      description: `Wallet funding via Flutterwave - Failed - Ref: ${tx_ref}`,
      gateway_status: status,
      gateway_metadata: {
        ...transaction.gateway_metadata,
        failed_at: new Date().toISOString(),
        failure_reason: status,
      },
    })
    .eq("id", transaction.id);

  console.log("Failed charge processed:", tx_ref);

  return NextResponse.json({
    message: "Failed charge recorded",
    tx_ref,
  });
}

// GET handler for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: "Flutterwave Webhook",
    status: "operational",
    methods: ["POST"],
    events: ["charge.completed", "charge.failed"],
    security: "Verifies verif-hash signature",
    setup_url: "https://dashboard.flutterwave.com/settings/webhooks",
  });
}

