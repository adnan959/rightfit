import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const LEADS_FILE = join(process.cwd(), "data", "leads.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const converted = searchParams.get("converted");

    if (isSupabaseConfigured() && supabaseAdmin) {
      return await getSupabaseLeads({ page, limit, converted });
    } else {
      return await getJsonLeads({ page, limit, converted });
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

async function getSupabaseLeads({
  page,
  limit,
  converted,
}: {
  page: number;
  limit: number;
  converted: string | null;
}) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  let query = supabaseAdmin
    .from("leads")
    .select("*", { count: "exact" });

  if (converted !== null) {
    query = query.eq("converted", converted === "true");
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
    leads: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

async function getJsonLeads({
  page,
  limit,
  converted,
}: {
  page: number;
  limit: number;
  converted: string | null;
}) {
  if (!existsSync(LEADS_FILE)) {
    return NextResponse.json({
      success: true,
      leads: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    });
  }

  let leads = JSON.parse(await readFile(LEADS_FILE, "utf-8"));

  // Apply filter
  if (converted !== null) {
    leads = leads.filter(
      (l: { converted: boolean }) => l.converted === (converted === "true")
    );
  }

  // Sort by timestamp descending
  leads.sort(
    (a: { timestamp: string }, b: { timestamp: string }) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply pagination
  const total = leads.length;
  const start = (page - 1) * limit;
  const paginatedLeads = leads.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    leads: paginatedLeads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// PATCH - Mark a lead as converted
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, converted, submission_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Lead updates require Supabase to be configured" },
        { status: 501 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (converted !== undefined) {
      updates.converted = converted;
      if (converted) {
        updates.converted_at = new Date().toISOString();
      }
    }
    if (submission_id) updates.converted_submission_id = submission_id;

    const { data, error } = await supabaseAdmin
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      lead: data,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
