import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, user_id } = body;

    if (!uuid) {
      return NextResponse.json(
        { success: false, error: "Missing payment UUID" },
        { status: 400 }
      );
    }

    console.log(`Verifying payment ${uuid} for user ${user_id || "unknown"}`);

    // Get payment info from Cryptomus
    const paymentResult = await cryptomusAPI.getPaymentInfo(uuid);

    if (paymentResult.state !== 0) {
      return NextResponse.json(
        { success: false, error: "Failed to get payment info from Cryptomus" },
        { status: 400 }
      );
    }

    const payment = paymentResult.result;
    console.log("Payment details:", {
      uuid: payment.uuid,
      order_id: payment.order_id,
      status: payment.status,
      amount_usd: payment.payment_amount_usd,
      currency: payment.currency,
    });

    // Check if payment is paid
    if (payment.status !== "paid") {
      return NextResponse.json({
        success: true,
        message: `Payment is not paid. Current status: ${payment.status}`,
        data: {
          uuid: payment.uuid,
          order_id: payment.order_id,
          status: payment.status,
          amount_usd: payment.payment_amount_usd,
          currency: payment.currency,
        },
      });
    }

    // Extract user ID from additional_data
    let additionalDataUserId;
    try {
      const additionalData = JSON.parse(payment.additional_data || "{}");
      additionalDataUserId = additionalData.user_id;
    } catch (error) {
      console.error("Error parsing additional_data:", error);
    }

    // If user_id is provided, verify it matches
    if (user_id && additionalDataUserId && additionalDataUserId !== user_id) {
      return NextResponse.json(
        {
          success: false,
          error: `User ID mismatch. Payment belongs to ${additionalDataUserId}, but requested for ${user_id}`,
        },
        { status: 400 }
      );
    }

    const finalUserId = user_id || additionalDataUserId;
    if (!finalUserId) {
      return NextResponse.json(
        { success: false, error: "No user ID found in payment data" },
        { status: 400 }
      );
    }

    const amountUsd = parseFloat(payment.payment_amount_usd);

    // Check if this payment has already been processed
    const { data: existingTransaction, error: existingError } =
      await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("reference_id", payment.uuid)
        .eq("status", "completed")
        .single();

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        data: {
          uuid: payment.uuid,
          order_id: payment.order_id,
          status: payment.status,
          amount_usd: amountUsd,
          currency: payment.currency,
          user_id: finalUserId,
          already_processed: true,
          transaction_id: existingTransaction.id,
        },
      });
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance")
      .eq("id", finalUserId)
      .single();

    let currentBalance = 0;
    if (profileError) {
      console.log("Profile not found, creating new profile...");
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: finalUserId,
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

    const newBalance = currentBalance + amountUsd;

    // Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", finalUserId);

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
          user_id: finalUserId,
          type: "deposit",
          amount: amountUsd,
          description: `Wallet funding via Cryptomus (${payment.currency}) - UUID: ${payment.uuid}`,
          status: "completed",
          reference_id: payment.uuid,
        })
        .select()
        .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // Don't fail the whole operation if transaction creation fails
    }

    console.log(
      `Successfully processed payment for user ${finalUserId}: +$${amountUsd} (${payment.currency})`
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and wallet updated successfully",
      data: {
        uuid: payment.uuid,
        order_id: payment.order_id,
        status: payment.status,
        amount_usd: amountUsd,
        currency: payment.currency,
        user_id: finalUserId,
        previous_balance: currentBalance,
        new_balance: newBalance,
        transaction_id: newTransaction?.id,
      },
    });
  } catch (error) {
    console.error("Verify payment by UUID error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
