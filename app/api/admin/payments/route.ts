import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { PaymentInsert } from "@/lib/db/types";

// GET all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        message: "Payments require Supabase to be configured",
      });
    }

    let query = supabaseAdmin
      .from("payments")
      .select("*, submissions(full_name, email)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      payments: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Create a payment record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, amount, status = "pending" } = body;

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Payments require Supabase to be configured" },
        { status: 501 }
      );
    }

    const paymentData: PaymentInsert = {
      submission_id,
      amount: amount * 100, // Convert to cents
      currency: "usd",
      status,
      stripe_payment_intent_id: null,
      stripe_checkout_session_id: null,
      stripe_customer_id: null,
      refund_amount: null,
      refund_reason: null,
      refunded_at: null,
      metadata: {},
    };

    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    if (submission_id) {
      await supabaseAdmin.from("activity_log").insert({
        submission_id,
        action: "payment_created",
        description: `Payment of $${amount} recorded`,
        actor: "admin",
      });
    }

    return NextResponse.json({
      success: true,
      payment: data,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// PATCH - Update a payment (mark as paid, process refund, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, refund_amount, refund_reason } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Payments require Supabase to be configured" },
        { status: 501 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (refund_amount !== undefined) updates.refund_amount = refund_amount * 100;
    if (refund_reason) updates.refund_reason = refund_reason;
    if (status === "refunded") updates.refunded_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select("*, submissions(id)")
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    if (data?.submissions?.id) {
      await supabaseAdmin.from("activity_log").insert({
        submission_id: data.submissions.id,
        action: status === "refunded" ? "payment_refunded" : "payment_updated",
        description: `Payment ${status}${refund_reason ? `: ${refund_reason}` : ""}`,
        actor: "admin",
      });
    }

    return NextResponse.json({
      success: true,
      payment: data,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
