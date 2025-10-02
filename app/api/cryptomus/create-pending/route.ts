import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, order_id, amount } = body;

    if (!user_id || !order_id || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user_id, order_id, amount" },
        { status: 400 }
      );
    }

    console.log(`Creating pending transaction for user ${user_id}, order ${order_id}, amount $${amount}`);

    // Create a pending transaction record
    const { data: newTransaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user_id,
        type: "deposit",
        amount: parseFloat(amount),
        description: `Wallet funding via Cryptomus - Pending`,
        status: "pending",
        reference_id: order_id,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating pending transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to create pending transaction" },
        { status: 500 }
      );
    }

    console.log("Pending transaction created successfully:", newTransaction.id);

    return NextResponse.json({
      success: true,
      message: "Pending transaction created",
      data: {
        transaction_id: newTransaction.id,
        order_id: order_id,
        amount: amount,
        status: "pending"
      }
    });

  } catch (error) {
    console.error("Create pending transaction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
