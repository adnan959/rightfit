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

    console.log("Order fetch request:", { id, hasToken: !!token, hasEmail: !!email });
    console.log("Supabase configured:", isSupabaseConfigured(), "supabaseAdmin exists:", !!supabaseAdmin);

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      console.error("Supabase not configured for order fetch");
      console.error("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
      console.error("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
      return NextResponse.json(
        { success: false, error: "Service unavailable - Supabase not configured" },
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

    if (error) {
      console.error("Supabase error fetching order:", error);
      return NextResponse.json(
        { success: false, error: `Order not found: ${error.message}` },
        { status: 404 }
      );
    }

    if (!order) {
      console.error("Order not found for id:", id);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Order found:", { id: order.id, email: order.email });

    // Verify access - either by token or by email match
    let hasAccess = false;

    if (token) {
      hasAccess = verifyOrderToken(id, order.email, token);
      console.log("Token verification result:", hasAccess);
    } else if (email) {
      hasAccess = email.toLowerCase() === order.email.toLowerCase();
      console.log("Email match result:", hasAccess);
    }

    if (!hasAccess) {
      console.error("Access denied for order:", { id, providedToken: !!token, providedEmail: email });
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
