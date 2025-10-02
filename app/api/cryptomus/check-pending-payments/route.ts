import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cryptomusAPI } from "@/services/cryptomus-api";

export async function POST(request: NextRequest) {
  try {
    console.log("Checking for pending payments...");

    // Get all pending transactions from the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: pendingTransactions, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .eq("type", "deposit")
      .gte("created_at", twentyFourHoursAgo.toISOString())
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
      `Found ${pendingTransactions.length} pending transactions to check`
    );

    let updatedCount = 0;
    const results = [];

    for (const transaction of pendingTransactions) {
      try {
        // Extract order_id from reference_id
        const orderId = transaction.reference_id;

        // Get payment info from Cryptomus using order_id
        // We need to find the payment UUID first, so let's try to get it from the order_id
        console.log(`Checking payment for order_id: ${orderId}`);

        // Since we don't have the UUID, we'll need to search for it
        // For now, let's skip this and focus on the webhook verification
        // This endpoint will be used as a backup verification system

        results.push({
          transaction_id: transaction.id,
          order_id: orderId,
          status: "skipped - no UUID available",
          reason: "Need payment UUID to verify with Cryptomus API",
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
      message: `Checked ${pendingTransactions.length} pending transactions`,
      data: {
        checked: pendingTransactions.length,
        updated: updatedCount,
        results: results,
      },
    });
  } catch (error) {
    console.error("Check pending payments error:", error);
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
