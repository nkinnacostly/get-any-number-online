import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email, full_name } = body;

    if (!user_id || !email) {
      return NextResponse.json(
        { error: "user_id and email are required" },
        { status: 400 }
      );
    }

    console.log(`Creating test user: ${email} (${user_id})`);

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user_id,
        email: email,
        full_name: full_name || "Test User",
        wallet_balance: 0.00
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile", details: profileError },
        { status: 500 }
      );
    }

    console.log("Profile created successfully:", profile);

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      data: profile
    });

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
