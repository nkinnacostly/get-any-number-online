import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount_usd, description } = body;

    if (!user_id || !amount_usd) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user_id, amount_usd" },
        { status: 400 }
      );
    }

    console.log(`Updating balance for user ${user_id} by $${amount_usd}`);

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const currentBalance = profile.wallet_balance || 0;
    const newBalance = currentBalance + parseFloat(amount_usd);

    // Update wallet balance
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
      `Successfully updated balance for user ${user_id}: $${currentBalance} -> $${newBalance}`
    );

    return NextResponse.json({
      success: true,
      message: "Balance updated successfully",
      data: {
        user_id,
        amount_added: parseFloat(amount_usd),
        previous_balance: currentBalance,
        new_balance: newBalance
      }
    });

  } catch (error) {
    console.error("Update balance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
