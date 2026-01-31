import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured, getSignedUrl, CV_STORAGE_BUCKET } from "@/lib/supabase";
import type { SubmissionWithRelations, SubmissionUpdate } from "@/lib/db/types";

const SUBMISSIONS_DIR = join(process.cwd(), "data", "submissions");

// GET a single submission with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured() && supabaseAdmin) {
      return await getSupabaseSubmission(id);
    } else {
      return await getJsonSubmission(id);
    }
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

// PATCH to update a submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (isSupabaseConfigured() && supabaseAdmin) {
      return await updateSupabaseSubmission(id, body);
    } else {
      return await updateJsonSubmission(id, body);
    }
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

async function getSupabaseSubmission(id: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  // Get submission
  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  // Get related data
  const [aiGradesResult, notesResult, paymentsResult, activityResult] = await Promise.all([
    supabaseAdmin
      .from("ai_grades")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("review_notes")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("payments")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("activity_log")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // Get signed URLs for files
  let cvFileUrl: string | null = null;
  let coverLetterUrl: string | null = null;
  let rewrittenCvUrl: string | null = null;

  if (submission.cv_file_path) {
    const { url } = await getSignedUrl(CV_STORAGE_BUCKET, submission.cv_file_path);
    cvFileUrl = url;
  }

  if (submission.cover_letter_file_path) {
    const { url } = await getSignedUrl(CV_STORAGE_BUCKET, submission.cover_letter_file_path);
    coverLetterUrl = url;
  }

  if (submission.rewritten_cv_path) {
    const { url } = await getSignedUrl(CV_STORAGE_BUCKET, submission.rewritten_cv_path);
    rewrittenCvUrl = url;
  }

  const result: SubmissionWithRelations = {
    ...submission,
    ai_grades: aiGradesResult.data || [],
    review_notes: notesResult.data || [],
    payments: paymentsResult.data || [],
    activity_log: activityResult.data || [],
  };

  return NextResponse.json({
    success: true,
    submission: result,
    fileUrls: {
      cv: cvFileUrl,
      coverLetter: coverLetterUrl,
      rewrittenCv: rewrittenCvUrl,
    },
  });
}

async function getJsonSubmission(id: string) {
  const filePath = join(SUBMISSIONS_DIR, `${id}.json`);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  const data = JSON.parse(await readFile(filePath, "utf-8"));

  // Map to SubmissionWithRelations
  const submission: SubmissionWithRelations = {
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
    current_role: data.currentRole || null,
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
    ai_grades: [],
    review_notes: [],
    payments: [],
    activity_log: [],
  };

  // For JSON mode, file URLs are local paths
  const fileUrls = {
    cv: data.cvFileName ? `/api/admin/files/${data.cvFileName}` : null,
    coverLetter: data.coverLetterFileName
      ? `/api/admin/files/${data.coverLetterFileName}`
      : null,
    rewrittenCv: null,
  };

  return NextResponse.json({
    success: true,
    submission,
    fileUrls,
  });
}

async function updateSupabaseSubmission(id: string, updates: SubmissionUpdate) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabaseAdmin
    .from("submissions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log activity
  await supabaseAdmin.from("activity_log").insert({
    submission_id: id,
    action: "submission_updated",
    description: `Updated: ${Object.keys(updates).join(", ")}`,
    actor: "admin",
  });

  return NextResponse.json({
    success: true,
    submission: data,
  });
}

async function updateJsonSubmission(id: string, updates: Record<string, unknown>) {
  const filePath = join(SUBMISSIONS_DIR, `${id}.json`);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  const data = JSON.parse(await readFile(filePath, "utf-8"));
  
  // Apply updates (map from snake_case to camelCase)
  if (updates.status) data.status = updates.status;
  if (updates.priority) data.priority = updates.priority;
  
  const { writeFile } = await import("fs/promises");
  await writeFile(filePath, JSON.stringify(data, null, 2));

  return NextResponse.json({
    success: true,
    submission: data,
  });
}
