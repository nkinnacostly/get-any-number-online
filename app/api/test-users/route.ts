import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    // Get all transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .limit(10);

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        profiles: profiles || [],
        transactions: transactions || [],
        profile_count: profiles?.length || 0,
        transaction_count: transactions?.length || 0
      }
    });

  } catch (error) {
    console.error("Test users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
