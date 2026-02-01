import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { verifyOrderToken } from "@/lib/order-tokens";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Revision request content is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Service unavailable" },
        { status: 503 }
      );
    }

    // Fetch the order to verify access
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("submissions")
      .select("id, email, status, full_name")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify access with token
    if (!token || !verifyOrderToken(id, order.email, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Only allow revision requests for completed/delivered orders
    if (!["completed", "delivered"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: "Revision requests can only be submitted for completed orders" },
        { status: 400 }
      );
    }

    // Check if there's already a pending revision request
    const { data: existingRequest } = await supabaseAdmin
      .from("review_notes")
      .select("id")
      .eq("submission_id", id)
      .eq("note_type", "revision_request")
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "A revision request is already pending for this order" },
        { status: 400 }
      );
    }

    // Create the revision request as a review note
    const { error: insertError } = await supabaseAdmin
      .from("review_notes")
      .insert({
        submission_id: id,
        note_type: "revision_request",
        content: content.trim(),
        is_pinned: true,
      });

    if (insertError) {
      console.error("Failed to create revision request:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to submit revision request" },
        { status: 500 }
      );
    }

    // Log the activity
    await supabaseAdmin.from("activity_log").insert({
      submission_id: id,
      action: "Revision requested",
      description: `Customer requested a revision: ${content.slice(0, 100)}${content.length > 100 ? "..." : ""}`,
      actor: order.email,
    });

    // Update order status back to in_progress
    await supabaseAdmin
      .from("submissions")
      .update({ status: "in_progress" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      message: "Revision request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting revision request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit revision request" },
      { status: 500 }
    );
  }
}
