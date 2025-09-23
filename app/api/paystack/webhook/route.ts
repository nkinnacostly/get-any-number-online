import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get("x-paystack-signature");
    // if (!verifyPaystackSignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    // }

    const { event, data } = body;

    if (event === "charge.success") {
      const { reference, amount, customer } = data;

      // Extract user ID from metadata
      const userId = data.metadata?.user_id;

      if (!userId) {
        console.error("No user ID found in payment metadata");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      // Convert amount from kobo to dollars
      const amountInDollars = amount / 100;

      // Update wallet balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      const newBalance = (profile.wallet_balance || 0) + amountInDollars;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating wallet balance:", updateError);
        return NextResponse.json(
          { error: "Failed to update balance" },
          { status: 500 }
        );
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: amountInDollars,
          description: `Wallet funding via Paystack - Ref: ${reference}`,
          status: "completed",
          reference_id: reference,
        });

      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        // Don't fail the webhook if transaction creation fails
      }

      console.log(
        `Successfully processed payment for user ${userId}: $${amountInDollars}`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Function to verify Paystack webhook signature (implement for production)
function verifyPaystackSignature(
  payload: any,
  signature: string | null
): boolean {
  // Implement Paystack signature verification
  // This is important for production security
  return true; // Placeholder - implement proper verification
}
