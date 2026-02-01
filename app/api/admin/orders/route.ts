import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionStatus } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const statusesParam = searchParams.get("statuses"); // comma-separated list
    const search = searchParams.get("search");

    // Build query
    let query = supabaseAdmin
      .from("submissions")
      .select("*", { count: "exact" });

    // Filter by statuses (comma-separated)
    if (statusesParam) {
      const statuses = statusesParam.split(",").filter(Boolean);
      if (statuses.length > 0) {
        query = query.in("status", statuses);
      }
    }

    // Search by name or email
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false });

    // Pagination
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      orders: orders || [],
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing id or status" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = { status };

    // Set timestamps based on status
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabaseAdmin
      .from("submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabaseAdmin.from("activity_log").insert({
        submission_id: id,
        action: `Status changed to ${status}`,
        actor: "admin",
      });
    } catch (logError) {
      console.error("Failed to log activity:", logError);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
