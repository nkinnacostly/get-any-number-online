import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Store the contact message in Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          status: "new",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error storing contact message:", error);
      return NextResponse.json(
        { error: "Failed to store message" },
        { status: 500 }
      );
    }

    // Send email notification
    try {
      await sendEmailNotification({
        name,
        email,
        message,
        messageId: data.id,
      });
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        id: data.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendEmailNotification({
  name,
  email,
  message,
  messageId,
}: {
  name: string;
  email: string;
  message: string;
  messageId: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const resend = new Resend(resendApiKey);

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message ID:</strong> ${messageId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">Message</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #666; font-size: 14px;">
        <p>This message was sent from the Get Any Number Online contact form.</p>
        <p>Please reply directly to the sender's email: <a href="mailto:${email}">${email}</a></p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: "Get Any Number Online <noreply@getanynumber.com>",
      to: ["ayangcostly@gmail.com"],
      subject: `New Contact Form Submission from ${name}`,
      html: emailContent,
      replyTo: email,
    });

    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
