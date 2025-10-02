import { NextRequest, NextResponse } from "next/server";
import { cryptomusAPI } from "@/services/cryptomus-api";
import { supabase } from "@/lib/supabase";

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

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user ID" },
        { status: 400 }
      );
    }

    console.log(`Getting payment info for UUID: ${uuid}`);

    // Get payment information from Cryptomus
    const result = await cryptomusAPI.getPaymentInfo(uuid);

    if (result.state !== 0) {
      return NextResponse.json(
        { success: false, error: "Failed to get payment info from Cryptomus" },
        { status: 400 }
      );
    }

    const paymentInfo = result.result;
    console.log(
      "Payment info from Cryptomus:",
      JSON.stringify(paymentInfo, null, 2)
    );

    // Check if payment is completed
    if (paymentInfo.status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          error: `Payment not completed. Status: ${paymentInfo.status}`,
          payment_status: paymentInfo.status,
        },
        { status: 400 }
      );
    }

    const amountInDollars = parseFloat(paymentInfo.payment_amount_usd);
    console.log(`Processing payment: $${amountInDollars} for user ${user_id}`);

    // Find the pending transaction by order_id
    console.log(
      `Looking for pending transaction with order_id: ${paymentInfo.order_id}`
    );
    const { data: pendingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference_id", paymentInfo.order_id)
      .eq("status", "pending")
      .eq("user_id", user_id)
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
        description: `Wallet funding via Cryptomus (${paymentInfo.currency}) - UUID: ${uuid}`,
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
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const newBalance = (profile.wallet_balance || 0) + amountInDollars;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", user_id);

    if (updateError) {
      console.error("Error updating wallet balance:", updateError);
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 500 }
      );
    }

    console.log(
      `Successfully processed Cryptomus payment for user ${user_id}: $${amountInDollars} (${paymentInfo.currency})`
    );

    return NextResponse.json({
      success: true,
      message: "Payment confirmed and balance updated",
      data: {
        uuid,
        amount_usd: amountInDollars,
        currency: paymentInfo.currency,
        new_balance: newBalance,
        transaction_id: pendingTransaction.id,
      },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
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
