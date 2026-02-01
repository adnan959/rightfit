import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured, getSignedUrl, CV_STORAGE_BUCKET } from "@/lib/supabase";
import { verifyOrderToken } from "@/lib/order-tokens";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Service unavailable" },
        { status: 503 }
      );
    }

    // Fetch the order
    const { data: order, error } = await supabaseAdmin
      .from("submissions")
      .select(`
        id,
        created_at,
        updated_at,
        status,
        full_name,
        email,
        job_titles,
        industries,
        cv_file_path,
        rewritten_cv_path,
        delivered_at,
        completed_at
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify access - either by token or by email match
    let hasAccess = false;

    if (token) {
      hasAccess = verifyOrderToken(id, order.email, token);
    } else if (email) {
      hasAccess = email.toLowerCase() === order.email.toLowerCase();
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Invalid access token or email" },
        { status: 403 }
      );
    }

    // Get activity log for timeline
    const { data: activities } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: true });

    // Get any info requests (notes with specific type)
    const { data: infoRequests } = await supabaseAdmin
      .from("review_notes")
      .select("*")
      .eq("submission_id", id)
      .in("note_type", ["info_request", "revision_request"])
      .order("created_at", { ascending: false });

    // Generate signed URL for delivered CV if exists
    let downloadUrl: string | null = null;
    if (order.rewritten_cv_path && ["completed", "delivered"].includes(order.status)) {
      const { url } = await getSignedUrl(CV_STORAGE_BUCKET, order.rewritten_cv_path, 86400); // 24 hours
      downloadUrl = url || null;
    }

    // Return sanitized order data (don't expose sensitive fields)
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        fullName: order.full_name,
        email: order.email,
        jobTitles: order.job_titles,
        industries: order.industries,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        deliveredAt: order.delivered_at,
        completedAt: order.completed_at,
      },
      downloadUrl,
      timeline: activities || [],
      infoRequests: infoRequests || [],
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
