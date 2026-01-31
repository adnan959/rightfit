import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { DashboardStats } from "@/lib/db/types";

const SUBMISSIONS_DIR = join(process.cwd(), "data", "submissions");

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      return await getSupabaseStats();
    } else {
      return await getJsonStats();
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function getSupabaseStats() {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  // Get total submissions
  const { count: totalSubmissions } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true });

  // Get pending count
  const { count: pendingCount } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Get in_progress count
  const { count: inProgressCount } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress");

  // Get completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: completedToday } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("completed_at", today.toISOString());

  // Get total revenue (paid payments)
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("amount")
    .eq("status", "paid");

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Get pending revenue
  const { data: pendingPayments } = await supabaseAdmin
    .from("payments")
    .select("amount")
    .eq("status", "pending");

  const pendingRevenue = pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const stats: DashboardStats = {
    total_submissions: totalSubmissions || 0,
    pending_count: pendingCount || 0,
    in_progress_count: inProgressCount || 0,
    completed_today: completedToday || 0,
    total_revenue: totalRevenue,
    pending_revenue: pendingRevenue,
  };

  return NextResponse.json({
    success: true,
    stats,
  });
}

async function getJsonStats() {
  if (!existsSync(SUBMISSIONS_DIR)) {
    const stats: DashboardStats = {
      total_submissions: 0,
      pending_count: 0,
      in_progress_count: 0,
      completed_today: 0,
      total_revenue: 0,
      pending_revenue: 0,
    };
    return NextResponse.json({ success: true, stats });
  }

  const files = await readdir(SUBMISSIONS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  let pendingCount = 0;
  let inProgressCount = 0;
  let completedToday = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(
        await readFile(join(SUBMISSIONS_DIR, file), "utf-8")
      );
      
      const status = data.status || "pending";
      if (status === "pending") pendingCount++;
      if (status === "in_progress") inProgressCount++;
      if (status === "completed") {
        const completedAt = data.completedAt ? new Date(data.completedAt) : null;
        if (completedAt && completedAt >= today) {
          completedToday++;
        }
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }

  // For JSON mode, we don't track payments yet
  const stats: DashboardStats = {
    total_submissions: jsonFiles.length,
    pending_count: pendingCount,
    in_progress_count: inProgressCount,
    completed_today: completedToday,
    total_revenue: 0,
    pending_revenue: 0,
  };

  return NextResponse.json({
    success: true,
    stats,
  });
}
