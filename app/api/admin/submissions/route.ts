import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { Submission, SubmissionStatus } from "@/lib/db/types";

const SUBMISSIONS_DIR = join(process.cwd(), "data", "submissions");

// GET all submissions with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as SubmissionStatus | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (isSupabaseConfigured() && supabaseAdmin) {
      return await getSupabaseSubmissions({ status, search, page, limit, sortBy, sortOrder });
    } else {
      return await getJsonSubmissions({ status, search, page, limit, sortBy, sortOrder });
    }
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// PATCH to update a submission's status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      const { data, error } = await supabaseAdmin
        .from("submissions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseAdmin.from("activity_log").insert({
        submission_id: id,
        action: "status_updated",
        description: `Status changed to ${status || priority}`,
        actor: "admin",
      });

      return NextResponse.json({ success: true, submission: data });
    } else {
      // Update JSON file
      const filePath = join(SUBMISSIONS_DIR, `${id}.json`);
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      const data = JSON.parse(await readFile(filePath, "utf-8"));
      if (status) data.status = status;
      if (priority) data.priority = priority;
      
      const { writeFile } = await import("fs/promises");
      await writeFile(filePath, JSON.stringify(data, null, 2));

      return NextResponse.json({ success: true, submission: data });
    }
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

async function getSupabaseSubmissions({
  status,
  search,
  page,
  limit,
  sortBy,
  sortOrder,
}: {
  status: SubmissionStatus | null;
  search: string | null;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  let query = supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact" });

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Apply sorting
  const ascending = sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    submissions: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

async function getJsonSubmissions({
  status,
  search,
  page,
  limit,
  sortBy,
  sortOrder,
}: {
  status: SubmissionStatus | null;
  search: string | null;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) {
  if (!existsSync(SUBMISSIONS_DIR)) {
    return NextResponse.json({
      success: true,
      submissions: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    });
  }

  const files = await readdir(SUBMISSIONS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  let submissions: Submission[] = [];

  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(
        await readFile(join(SUBMISSIONS_DIR, file), "utf-8")
      );
      // Map JSON structure to Submission type
      submissions.push({
        id: data.id,
        created_at: data.timestamp,
        updated_at: data.timestamp,
        status: data.status || "pending",
        priority: data.priority || "normal",
        full_name: data.fullName,
        email: data.email,
        linkedin_url: data.linkedinUrl || null,
        industries: data.industries || [],
        job_titles: data.jobTitles,
        career_stage: data.careerStage,
        timeline: data.timeline,
        location: data.location,
        current_job_role: data.currentRole || null,
        achievements: data.achievements || null,
        challenges: data.challenges || [],
        additional_context: data.additionalContext || null,
        has_cover_letter: data.hasCoverLetter || "no",
        certifications: data.certifications || null,
        tools: data.tools || null,
        cv_file_path: data.cvFileName || null,
        cover_letter_file_path: data.coverLetterFileName || null,
        rewritten_cv_path: null,
        assigned_to: null,
        due_date: null,
        completed_at: null,
        delivered_at: null,
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }

  // Apply filters
  if (status) {
    submissions = submissions.filter((s) => s.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    submissions = submissions.filter(
      (s) =>
        s.full_name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  const sortField = sortBy as keyof Submission;
  submissions.sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Apply pagination
  const total = submissions.length;
  const start = (page - 1) * limit;
  const paginatedSubmissions = submissions.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    submissions: paginatedSubmissions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
