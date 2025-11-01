import { NextRequest, NextResponse } from "next/server";
import { flutterwaveAPI } from "@/services/flutterwave-api";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/flutterwave/verify-payment
 *
 * Verify a Flutterwave payment transaction and update wallet balance
 *
 * This endpoint should be called:
 * 1. After user is redirected back from Flutterwave payment page
 * 2. By webhook handler for server-side verification
 * 3. By frontend polling for payment status updates
 *
 * Request Body:
 * {
 *   tx_ref: string,         // Transaction reference
 *   transaction_id?: string // Optional: Flutterwave transaction ID
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     status: string,       // "successful", "failed", "pending"
 *     amount: number,       // Amount in NGN
 *     amount_usd: number,   // Amount in USD
 *     tx_ref: string,
 *     already_processed: boolean
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { tx_ref, transaction_id } = body;

    console.log("Verify payment request:", { tx_ref, transaction_id });

    // Validate required fields
    if (!tx_ref && !transaction_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: tx_ref or transaction_id is required",
        },
        { status: 400 }
      );
    }

    // Prioritize transaction_id (Flutterwave's ID) over tx_ref (our custom reference)
    const verificationId = transaction_id || tx_ref;
    console.log("Verifying Flutterwave payment with ID:", verificationId);

    // Step 1: Verify payment with Flutterwave API
    let verification;
    try {
      verification = await flutterwaveAPI.verifyPayment(verificationId);
      console.log("Flutterwave verification response:", {
        status: verification.status,
        data_status: verification.data?.status,
      });
    } catch (apiError: any) {
      console.error("Flutterwave verification API error:", apiError);

      // Provide more helpful error message
      let errorMsg = apiError.message || "Unknown error";
      if (errorMsg.includes("No transaction was found")) {
        errorMsg = `Transaction not found. This might happen if: 1) Payment was cancelled, 2) Using wrong ID, or 3) Payment not yet processed. ID used: ${verificationId}`;
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to verify payment with Flutterwave: ${errorMsg}`,
        },
        { status: 500 }
      );
    }

    if (verification.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: verification.message || "Payment verification failed",
        },
        { status: 400 }
      );
    }

    const payment = verification.data;
    console.log("Payment details from Flutterwave:", {
      tx_ref: payment.tx_ref,
      flw_ref: payment.flw_ref,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    });

    // Step 2: Check if payment is successful
    if (payment.status !== "successful") {
      return NextResponse.json({
        success: true,
        data: {
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          tx_ref: payment.tx_ref,
          message: `Payment status: ${payment.status}`,
        },
      });
    }

    // Step 3: Find or determine the user
    let userId: string | null = null;

    // First, try to find existing transaction in database
    const { data: existingTransaction, error: transactionError } =
      await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("gateway_transaction_id", payment.tx_ref)
        .eq("payment_method", "flutterwave")
        .maybeSingle();

    if (existingTransaction) {
      console.log("Found existing transaction in database");

      // Check if already processed (prevent double-crediting)
      if (
        existingTransaction.status === "completed" &&
        existingTransaction.amount > 0
      ) {
        console.log("Payment already processed:", payment.tx_ref);
        return NextResponse.json({
          success: true,
          data: {
            status: "successful",
            amount: payment.amount,
            amount_usd: existingTransaction.amount,
            currency: payment.currency,
            tx_ref: payment.tx_ref,
            already_processed: true,
            message: "Payment already processed",
          },
        });
      }

      userId = existingTransaction.user_id;
    } else {
      // Transaction not found - extract user_id from payment metadata
      console.log("Transaction not found in database, creating new one");

      // Try to get user_id from metadata (cast to any to access meta field)
      const paymentData = payment as any;
      if (paymentData.meta && typeof paymentData.meta === "object") {
        userId = paymentData.meta.user_id || null;
      }

      // Also try customer email to find user
      if (!userId && payment.customer && payment.customer.email) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", payment.customer.email)
          .single();

        if (profile) {
          userId = profile.id;
        }
      }

      if (!userId) {
        console.error("Cannot determine user_id from payment data");
        return NextResponse.json(
          {
            success: false,
            error: "Cannot determine user for this payment",
          },
          { status: 400 }
        );
      }
    }

    // Step 4: Calculate USD amount from NGN
    // We need to convert NGN to USD for storage
    // Get current exchange rate from the database
    const { data: exchangeRate } = await supabaseAdmin
      .from("exchange_rates")
      .select("ngn_to_usd_rate")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Use exchange rate or fallback to approximate rate (1650 NGN = 1 USD)
    const ngnToUsdRate = exchangeRate?.ngn_to_usd_rate || 0.0006; // ~1/1650
    const amountUsd = payment.amount * ngnToUsdRate;

    console.log("Converting NGN to USD:", {
      amount_ngn: payment.amount,
      rate: ngnToUsdRate,
      amount_usd: amountUsd,
    });

    // Step 5: Get current wallet balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("User profile not found:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 404 }
      );
    }

    const currentBalance = profile.wallet_balance || 0;
    const newBalance = currentBalance + amountUsd;

    console.log("Updating wallet balance:", {
      user_id: userId,
      current_balance: currentBalance,
      adding: amountUsd,
      new_balance: newBalance,
    });

    // Step 6: Update wallet balance (atomic operation)
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update wallet balance:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update wallet balance",
        },
        { status: 500 }
      );
    }

    // Step 7: Create or update transaction record
    let finalTransaction;

    if (existingTransaction) {
      // Update existing transaction
      const { data: updatedTx, error: updateTxError } = await supabaseAdmin
        .from("transactions")
        .update({
          status: "completed",
          amount: amountUsd, // Store in USD
          description: `Wallet funding via Flutterwave - ₦${payment.amount.toFixed(
            2
          )} - Ref: ${payment.tx_ref}`,
          gateway_reference: payment.flw_ref,
          gateway_status: payment.status,
          gateway_metadata: {
            ...existingTransaction.gateway_metadata,
            amount_ngn: payment.amount,
            amount_usd: amountUsd,
            charged_amount: payment.charged_amount,
            currency: payment.currency,
            payment_type: payment.payment_type,
            customer: payment.customer,
            card: payment.card || null,
            processor_response: payment.processor_response,
            verified_at: new Date().toISOString(),
          },
        })
        .eq("id", existingTransaction.id)
        .select()
        .single();

      if (updateTxError) {
        console.error("Failed to update transaction:", updateTxError);
      }
      finalTransaction = updatedTx;
    } else {
      // Create new transaction
      const { data: newTx, error: createTxError } = await supabaseAdmin
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: amountUsd,
          description: `Wallet funding via Flutterwave - ₦${payment.amount.toFixed(
            2
          )} - Ref: ${payment.tx_ref}`,
          status: "completed",
          payment_method: "flutterwave",
          gateway_transaction_id: payment.tx_ref,
          gateway_reference: payment.flw_ref,
          gateway_status: payment.status,
          gateway_metadata: {
            amount_ngn: payment.amount,
            amount_usd: amountUsd,
            charged_amount: payment.charged_amount,
            currency: payment.currency,
            payment_type: payment.payment_type,
            customer: payment.customer,
            card: payment.card || null,
            processor_response: payment.processor_response,
            verified_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (createTxError) {
        console.error("Failed to create transaction:", createTxError);
      }
      finalTransaction = newTx;
    }

    console.log("Payment verified and processed successfully:", {
      tx_ref: payment.tx_ref,
      user_id: userId,
      amount_ngn: payment.amount,
      amount_usd: amountUsd,
      previous_balance: currentBalance,
      new_balance: newBalance,
    });

    // Step 8: Return success response
    return NextResponse.json({
      success: true,
      data: {
        status: "successful",
        amount: payment.amount,
        amount_usd: amountUsd,
        currency: payment.currency,
        tx_ref: payment.tx_ref,
        flw_ref: payment.flw_ref,
        previous_balance: currentBalance,
        new_balance: newBalance,
        already_processed: false,
        transaction_id: finalTransaction?.id,
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: "Flutterwave Verify Payment",
    status: "operational",
    methods: ["POST"],
    requiredFields: ["tx_ref OR transaction_id"],
    description: "Verifies a Flutterwave payment and updates wallet balance",
  });
}
