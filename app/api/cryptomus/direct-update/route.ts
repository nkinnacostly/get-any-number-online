import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    console.log(`Direct balance update for user ${user_id}: +$${amount_usd}`);

    // Use admin client to bypass RLS
    const serviceSupabase = supabaseAdmin;

    // First, try to get current balance
    const { data: profile, error: profileError } = await serviceSupabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user_id)
      .single();

    let currentBalance = 0;
    if (profileError) {
      console.log("Profile not found, creating new profile...");
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await serviceSupabase
        .from("profiles")
        .insert({
          id: user_id,
          email: "test@example.com", // Placeholder
          wallet_balance: 0.00
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

    const newBalance = currentBalance + parseFloat(amount_usd);

    // Update wallet balance
    const { error: updateError } = await serviceSupabase
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

    // Create transaction record
    const { error: transactionError } = await serviceSupabase
      .from("transactions")
      .insert({
        user_id: user_id,
        type: "deposit",
        amount: parseFloat(amount_usd),
        description: description || `Direct balance update - Cryptomus payment`,
        status: "completed",
        reference_id: `direct_update_${Date.now()}`
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // Don't fail the whole operation if transaction creation fails
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
    console.error("Direct update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
