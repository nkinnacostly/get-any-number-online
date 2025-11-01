import { NextRequest, NextResponse } from "next/server";
import { flutterwaveAPI } from "@/services/flutterwave-api";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/flutterwave/initiate-payment
 * 
 * Initialize a Flutterwave payment transaction
 * 
 * Request Body:
 * {
 *   amount: number,          // Amount in NGN
 *   userId: string,          // User ID
 *   userEmail: string,       // User email
 *   userName?: string,       // User name (optional)
 *   userPhone?: string       // User phone (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     payment_link: string,  // URL to redirect user to
 *     tx_ref: string,        // Transaction reference
 *     amount: number         // Amount in NGN
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { amount, userId, userEmail, userName, userPhone } = body;

    // Validate required fields
    if (!amount || !userId || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, userId, and userEmail are required",
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount. Must be a positive number" },
        { status: 400 }
      );
    }

    // Check minimum amount (₦100)
    if (amountNum < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum funding amount is ₦100.00",
        },
        { status: 400 }
      );
    }

    // Validate with Flutterwave API
    if (!flutterwaveAPI.validateAmount(amountNum, "NGN")) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount does not meet Flutterwave requirements",
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("User not found:", profileError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Generate unique transaction reference
    const txRef = flutterwaveAPI.generateTxRef(userId, "FLW");

    console.log("Creating Flutterwave payment:", {
      tx_ref: txRef,
      amount: amountNum,
      user_id: userId,
      user_email: userEmail,
    });

    // Create pending transaction in database FIRST
    // This ensures we have a record even if the payment initialization fails
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        type: "deposit",
        amount: 0, // Will be updated when payment is verified
        description: `Wallet funding via Flutterwave - Pending - Ref: ${txRef}`,
        status: "pending",
        reference_id: txRef,
        payment_method: "flutterwave",
        gateway_transaction_id: txRef,
        gateway_status: "pending",
        gateway_metadata: {
          amount_ngn: amountNum,
          customer_email: userEmail,
          customer_name: userName || profile.full_name || "Customer",
          customer_phone: userPhone || "",
          initiated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create transaction record",
        },
        { status: 500 }
      );
    }

    console.log("Transaction record created:", transaction.id);

    // Get base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Initialize payment with Flutterwave
    const paymentData = {
      tx_ref: txRef,
      amount: amountNum,
      currency: "NGN",
      redirect_url: `${baseUrl}/wallet?payment=flutterwave&status=callback`,
      customer: {
        email: userEmail,
        name: userName || profile.full_name || "Customer",
        phonenumber: userPhone || "",
      },
      customizations: {
        title: "Wallet Funding",
        description: "Add funds to your SMS Pool wallet",
        logo: `${baseUrl}/icon.svg`,
      },
      payment_options: flutterwaveAPI.getPaymentOptions(["card", "banktransfer", "ussd"]),
      meta: {
        user_id: userId,
        transaction_id: transaction.id,
        funding_type: "Wallet Funding",
      },
    };

    try {
      const result = await flutterwaveAPI.initializePayment(paymentData);

      if (result.status !== "success") {
        // Update transaction to failed
        await supabaseAdmin
          .from("transactions")
          .update({
            status: "failed",
            description: `Wallet funding via Flutterwave - Failed: ${result.message}`,
            gateway_status: "initialization_failed",
          })
          .eq("id", transaction.id);

        return NextResponse.json(
          {
            success: false,
            error: result.message || "Failed to initialize payment",
          },
          { status: 400 }
        );
      }

      // Update transaction with payment link
      await supabaseAdmin
        .from("transactions")
        .update({
          gateway_metadata: {
            ...transaction.gateway_metadata,
            payment_link: result.data.link,
          },
        })
        .eq("id", transaction.id);

      console.log("Payment initialized successfully:", {
        tx_ref: txRef,
        payment_link: result.data.link,
      });

      return NextResponse.json({
        success: true,
        data: {
          payment_link: result.data.link,
          tx_ref: txRef,
          amount: amountNum,
          transaction_id: transaction.id,
        },
      });
    } catch (apiError: any) {
      console.error("Flutterwave API error:", apiError);

      // Update transaction to failed
      await supabaseAdmin
        .from("transactions")
        .update({
          status: "failed",
          description: `Wallet funding via Flutterwave - API Error: ${apiError.message}`,
          gateway_status: "api_error",
        })
        .eq("id", transaction.id);

      return NextResponse.json(
        {
          success: false,
          error: apiError.message || "Failed to initialize payment with Flutterwave",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Initialize payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: "Flutterwave Initiate Payment",
    status: "operational",
    methods: ["POST"],
    requiredFields: ["amount", "userId", "userEmail"],
    optionalFields: ["userName", "userPhone"],
  });
}

