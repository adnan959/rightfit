import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured, uploadFile, CV_STORAGE_BUCKET } from "@/lib/supabase";
import { verifyOrderToken } from "@/lib/order-tokens";
import type { CareerStage, TimelineOption, CoverLetterOption } from "@/lib/db/types";

// Helper to log activity
async function logActivity(submissionId: string, action: string, description?: string) {
  if (!supabaseAdmin) return;
  
  try {
    await supabaseAdmin.from('activity_log').insert({
      submission_id: submissionId,
      action,
      description,
      actor: 'customer',
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Service unavailable" },
        { status: 503 }
      );
    }

    // Fetch the order to verify access and status
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("submissions")
      .select("id, email, status, full_name")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      console.error("Order not found:", fetchError);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify token
    if (!token || !verifyOrderToken(id, order.email, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Only allow updating orders with pending_details status
    if (order.status !== "pending_details") {
      return NextResponse.json(
        { success: false, error: "Order details have already been submitted" },
        { status: 400 }
      );
    }

    // Extract form data
    const linkedinUrl = formData.get("linkedinUrl") as string | null;
    const industriesJson = formData.get("industries") as string;
    const jobTitles = formData.get("jobTitles") as string;
    const careerStage = formData.get("careerStage") as string;
    const timeline = formData.get("timeline") as string;
    const location = formData.get("location") as string;
    const currentRole = formData.get("currentRole") as string;
    const achievements = formData.get("achievements") as string;
    const challengesJson = formData.get("challenges") as string;
    const additionalContext = formData.get("additionalContext") as string | null;
    const hasCoverLetter = formData.get("hasCoverLetter") as string;
    const certifications = formData.get("certifications") as string | null;
    const tools = formData.get("tools") as string | null;
    const cvFile = formData.get("cvFile") as File | null;
    const coverLetterFile = formData.get("coverLetterFile") as File | null;

    // Validate required fields
    if (!jobTitles || !careerStage || !timeline || !location || !currentRole || !achievements) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse JSON arrays
    let industries: string[] = [];
    let challenges: string[] = [];
    try {
      industries = JSON.parse(industriesJson || "[]");
      challenges = JSON.parse(challengesJson || "[]");
    } catch {
      if (industriesJson) industries = [industriesJson];
      if (challengesJson) challenges = [challengesJson];
    }

    // Calculate due date (96 hours from now)
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 96);

    // Update submission with details
    const updateData = {
      status: 'pending' as const, // Change from pending_details to pending
      linkedin_url: linkedinUrl || null,
      industries,
      job_titles: jobTitles,
      career_stage: careerStage as CareerStage,
      timeline: timeline as TimelineOption,
      location,
      current_role: currentRole,
      achievements,
      challenges,
      additional_context: additionalContext || null,
      has_cover_letter: hasCoverLetter as CoverLetterOption,
      certifications: certifications || null,
      tools: tools || null,
      due_date: dueDate.toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from("submissions")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating submission:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update order details" },
        { status: 500 }
      );
    }

    // Upload CV file if provided
    if (cvFile && cvFile.size > 0) {
      const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
      const ext = cvFile.name.split(".").pop() || "pdf";
      const cvPath = `submissions/${id}/original.${ext}`;

      const { error: uploadError } = await uploadFile(
        CV_STORAGE_BUCKET,
        cvPath,
        cvBuffer,
        cvFile.type
      );

      if (!uploadError) {
        await supabaseAdmin
          .from("submissions")
          .update({ cv_file_path: cvPath })
          .eq("id", id);
        
        await logActivity(id, "CV uploaded", `Original CV uploaded: ${cvFile.name}`);
      } else {
        console.error("CV upload error:", uploadError);
      }
    }

    // Upload cover letter file if provided
    if (coverLetterFile && coverLetterFile.size > 0) {
      const clBuffer = Buffer.from(await coverLetterFile.arrayBuffer());
      const ext = coverLetterFile.name.split(".").pop() || "pdf";
      const clPath = `submissions/${id}/cover_letter.${ext}`;

      const { error: uploadError } = await uploadFile(
        CV_STORAGE_BUCKET,
        clPath,
        clBuffer,
        coverLetterFile.type
      );

      if (!uploadError) {
        await supabaseAdmin
          .from("submissions")
          .update({ cover_letter_file_path: clPath })
          .eq("id", id);
      } else {
        console.error("Cover letter upload error:", uploadError);
      }
    }

    // Log activity
    await logActivity(
      id,
      "Order details submitted",
      `${order.full_name} completed their order details. Ready for processing.`
    );

    console.log("Order details updated:", {
      id,
      newStatus: "pending",
      industries,
      jobTitles,
      careerStage,
    });

    return NextResponse.json({
      success: true,
      message: "Order details submitted successfully",
    });
  } catch (error) {
    console.error("Error updating order details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order details" },
      { status: 500 }
    );
  }
}
