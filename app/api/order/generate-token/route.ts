import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { generateOrderToken } from "@/lib/order-tokens";

export async function POST(request: NextRequest) {
  try {
    const { orderId, email } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json(
        { success: false, error: "Order ID and email are required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Service unavailable" },
        { status: 503 }
      );
    }

    // Verify the order exists and email matches
    const { data: order, error } = await supabaseAdmin
      .from("submissions")
      .select("id, email")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify email matches
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Email does not match" },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateOrderToken(orderId, email);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
