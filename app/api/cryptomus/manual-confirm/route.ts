import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, user_id, amount_usd, currency, order_id } = body;

    if (!uuid || !user_id || !amount_usd) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: uuid, user_id, amount_usd",
        },
        { status: 400 }
      );
    }

    console.log(
      `Manually confirming payment: UUID ${uuid}, User ${user_id}, Amount $${amount_usd}`
    );

    // Create a new transaction record
    const { data: newTransaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user_id,
        type: "deposit",
        amount: parseFloat(amount_usd),
        description: `Manual wallet funding via Cryptomus (${
          currency || "Unknown"
        }) - UUID: ${uuid}`,
        status: "completed",
        reference_id: uuid,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to create transaction record" },
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

    const newBalance = (profile.wallet_balance || 0) + parseFloat(amount_usd);

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
      `Successfully processed manual Cryptomus payment for user ${user_id}: $${amount_usd}`
    );

    return NextResponse.json({
      success: true,
      message: "Payment manually confirmed and balance updated",
      data: {
        uuid,
        amount_usd: parseFloat(amount_usd),
        currency: currency || "Unknown",
        new_balance: newBalance,
        transaction_id: newTransaction.id,
      },
    });
  } catch (error) {
    console.error("Manual confirm payment error:", error);
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
