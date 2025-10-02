import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting background payment verification...");

    // Get all pending transactions from the last 48 hours
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const { data: pendingTransactions, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .eq("type", "deposit")
      .gte("created_at", fortyEightHoursAgo.toISOString())
      .like("reference_id", "wallet_funding_%");

    if (fetchError) {
      console.error("Error fetching pending transactions:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch pending transactions" },
        { status: 500 }
      );
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending payments found",
        data: { checked: 0, updated: 0 },
      });
    }

    console.log(
      `Found ${pendingTransactions.length} pending transactions to verify`
    );

    let updatedCount = 0;
    const results = [];

    for (const transaction of pendingTransactions) {
      try {
        const orderId = transaction.reference_id;
        console.log(
          `Checking transaction ${transaction.id} with order_id: ${orderId}`
        );

        // For now, we'll log that we found pending transactions
        // In a real implementation, you might want to:
        // 1. Store payment UUIDs when creating payments
        // 2. Use a different approach to find payments by order_id
        // 3. Implement a more sophisticated verification system

        results.push({
          transaction_id: transaction.id,
          order_id: orderId,
          user_id: transaction.user_id,
          amount: transaction.amount,
          created_at: transaction.created_at,
          status: "pending_verification",
          note: "Payment UUID needed for verification",
        });
      } catch (error) {
        console.error(`Error checking transaction ${transaction.id}:`, error);
        results.push({
          transaction_id: transaction.id,
          order_id: transaction.reference_id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Background verification completed. Found ${pendingTransactions.length} pending transactions.`,
      data: {
        checked: pendingTransactions.length,
        updated: updatedCount,
        results: results,
        recommendation:
          "Consider storing payment UUIDs when creating payments for better verification",
      },
    });
  } catch (error) {
    console.error("Background verification error:", error);
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
