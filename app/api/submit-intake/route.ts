import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured, uploadFile, CV_STORAGE_BUCKET } from "@/lib/supabase";
import { getStripe, isStripeConfigured, CV_REWRITE_PRICE } from "@/lib/stripe";
import { getResend, isResendConfigured, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { getOrderConfirmationEmail } from "@/lib/email-templates";
import { generateOrderUrl } from "@/lib/order-tokens";
import type { SubmissionInsert, CareerStage, TimelineOption, CoverLetterOption } from "@/lib/db/types";

// Fallback: Store submissions in JSON files (when Supabase is not configured)
const SUBMISSIONS_DIR = join(process.cwd(), "data", "submissions");

interface IntakeSubmission {
  id: string;
  timestamp: string;
  fullName: string;
  email: string;
  linkedinUrl?: string;
  industries: string[];
  jobTitles: string;
  careerStage: string;
  timeline: string;
  location: string;
  currentRole: string;
  achievements: string;
  challenges: string[];
  additionalContext?: string;
  hasCoverLetter: string;
  certifications?: string;
  tools?: string;
  cvFileName?: string;
  coverLetterFileName?: string;
  status: "pending" | "in_progress" | "completed";
}

// Helper to log activity
async function logActivity(submissionId: string, action: string, description?: string) {
  if (!supabaseAdmin) return;
  
  try {
    await supabaseAdmin.from('activity_log').insert({
      submission_id: submissionId,
      action,
      description,
      actor: 'system',
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Helper to send order confirmation email
async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string
): Promise<{ success: boolean; orderUrl: string }> {
  const orderUrl = generateOrderUrl(orderId, email);
  
  if (!isResendConfigured()) {
    console.log("Resend not configured, skipping confirmation email");
    return { success: false, orderUrl };
  }

  try {
    const resend = getResend();
    const emailContent = getOrderConfirmationEmail({
      customerName: name,
      customerEmail: email,
      orderId,
      orderDate: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      orderUrl,
    });

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      replyTo: EMAIL_REPLY_TO,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      console.error("Failed to send confirmation email:", error);
      return { success: false, orderUrl };
    }

    console.log("Confirmation email sent to:", email);
    return { success: true, orderUrl };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, orderUrl };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
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
    const paymentIntentId = formData.get("paymentIntentId") as string | null;

    // Extract files
    const cvFile = formData.get("cvFile") as File | null;
    const coverLetterFile = formData.get("coverLetterFile") as File | null;

    // Verify payment if Stripe is configured and payment intent provided
    let verifiedPayment = false;
    if (paymentIntentId && isStripeConfigured()) {
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === "succeeded") {
          verifiedPayment = true;
        } else {
          return NextResponse.json(
            { error: "Payment not completed. Please try again." },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
          { error: "Failed to verify payment" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!fullName || !email || !jobTitles || !careerStage || !timeline || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
      // If parsing fails, treat as single values
      if (industriesJson) industries = [industriesJson];
      if (challengesJson) challenges = [challengesJson];
    }

    // Use Supabase if configured, otherwise fall back to JSON files
    if (isSupabaseConfigured() && supabaseAdmin) {
      return await handleSupabaseSubmission({
        fullName,
        email,
        linkedinUrl,
        industries,
        jobTitles,
        careerStage: careerStage as CareerStage,
        timeline: timeline as TimelineOption,
        location,
        currentRole,
        achievements,
        challenges,
        additionalContext,
        hasCoverLetter: hasCoverLetter as CoverLetterOption,
        certifications,
        tools,
        cvFile,
        coverLetterFile,
        paymentIntentId,
        verifiedPayment,
      });
    } else {
      return await handleJsonSubmission({
        fullName,
        email,
        linkedinUrl,
        industries,
        jobTitles,
        careerStage,
        timeline,
        location,
        currentRole,
        achievements,
        challenges,
        additionalContext,
        hasCoverLetter,
        certifications,
        tools,
        cvFile,
        coverLetterFile,
        paymentIntentId,
        verifiedPayment,
      });
    }
  } catch (error) {
    console.error("Error processing intake submission:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process submission",
      },
      { status: 500 }
    );
  }
}

// Handle submission with Supabase
async function handleSupabaseSubmission(data: {
  fullName: string;
  email: string;
  linkedinUrl: string | null;
  industries: string[];
  jobTitles: string;
  careerStage: CareerStage;
  timeline: TimelineOption;
  location: string;
  currentRole: string;
  achievements: string;
  challenges: string[];
  additionalContext: string | null;
  hasCoverLetter: CoverLetterOption;
  certifications: string | null;
  tools: string | null;
  cvFile: File | null;
  coverLetterFile: File | null;
  paymentIntentId: string | null;
  verifiedPayment: boolean;
}) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  // Calculate due date (96 hours from now for standard, 48 for urgent)
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + 96);

  // Create submission record
  const submissionData: SubmissionInsert = {
    status: 'pending',
    priority: 'normal',
    full_name: data.fullName,
    email: data.email.toLowerCase(),
    linkedin_url: data.linkedinUrl || null,
    industries: data.industries,
    job_titles: data.jobTitles,
    career_stage: data.careerStage,
    timeline: data.timeline,
    location: data.location,
    current_role: data.currentRole || null,
    achievements: data.achievements || null,
    challenges: data.challenges,
    additional_context: data.additionalContext || null,
    has_cover_letter: data.hasCoverLetter,
    certifications: data.certifications || null,
    tools: data.tools || null,
    cv_file_path: null,
    cover_letter_file_path: null,
    rewritten_cv_path: null,
    assigned_to: null,
    due_date: dueDate.toISOString(),
    completed_at: null,
    delivered_at: null,
  };

  // Insert submission
  const { data: submission, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert(submissionData)
    .select()
    .single();

  if (insertError || !submission) {
    console.error("Supabase insert error:", insertError);
    throw new Error("Failed to create submission");
  }

  const submissionId = submission.id;

  // Upload CV file if provided
  if (data.cvFile && data.cvFile.size > 0) {
    const cvBuffer = Buffer.from(await data.cvFile.arrayBuffer());
    const ext = data.cvFile.name.split(".").pop() || 'pdf';
    const cvPath = `submissions/${submissionId}/original.${ext}`;
    
    const { error: uploadError } = await uploadFile(
      CV_STORAGE_BUCKET,
      cvPath,
      cvBuffer,
      data.cvFile.type
    );

    if (!uploadError) {
      await supabaseAdmin
        .from('submissions')
        .update({ cv_file_path: cvPath })
        .eq('id', submissionId);
    } else {
      console.error("CV upload error:", uploadError);
    }
  }

  // Upload cover letter if provided
  if (data.coverLetterFile && data.coverLetterFile.size > 0) {
    const clBuffer = Buffer.from(await data.coverLetterFile.arrayBuffer());
    const ext = data.coverLetterFile.name.split(".").pop() || 'pdf';
    const clPath = `submissions/${submissionId}/cover_letter.${ext}`;
    
    const { error: uploadError } = await uploadFile(
      CV_STORAGE_BUCKET,
      clPath,
      clBuffer,
      data.coverLetterFile.type
    );

    if (!uploadError) {
      await supabaseAdmin
        .from('submissions')
        .update({ cover_letter_file_path: clPath })
        .eq('id', submissionId);
    } else {
      console.error("Cover letter upload error:", uploadError);
    }
  }

  // Create payment record if payment was verified
  if (data.verifiedPayment && data.paymentIntentId) {
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        submission_id: submissionId,
        amount: CV_REWRITE_PRICE,
        currency: 'usd',
        status: 'paid',
        stripe_payment_intent_id: data.paymentIntentId,
        metadata: {
          product: 'cv_rewrite',
          email: data.email,
        },
      });

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    } else {
      await logActivity(submissionId, 'Payment received', `Payment of $${CV_REWRITE_PRICE / 100} received via Stripe`);
    }
  }

  // Log activity
  await logActivity(submissionId, 'Order submitted', `New order from ${data.fullName} (${data.email})`);

  // Send confirmation email and get order URL
  const { success: emailSent, orderUrl } = await sendOrderConfirmationEmail(data.email, data.fullName, submissionId);
  if (emailSent) {
    await logActivity(submissionId, 'Confirmation email sent', `Email sent to ${data.email}`);
  }

  console.log("New intake submission (Supabase):", {
    id: submissionId,
    email: data.email,
    fullName: data.fullName,
    paymentVerified: data.verifiedPayment,
    emailSent,
  });

  return NextResponse.json({
    success: true,
    submissionId,
    orderUrl,
    message: "Your CV revamp request has been submitted successfully!",
  });
}

// Fallback: Handle submission with JSON files
async function handleJsonSubmission(data: {
  fullName: string;
  email: string;
  linkedinUrl: string | null;
  industries: string[];
  jobTitles: string;
  careerStage: string;
  timeline: string;
  location: string;
  currentRole: string;
  achievements: string;
  challenges: string[];
  additionalContext: string | null;
  hasCoverLetter: string;
  certifications: string | null;
  tools: string | null;
  cvFile: File | null;
  coverLetterFile: File | null;
  paymentIntentId: string | null;
  verifiedPayment: boolean;
}) {
  // Generate submission ID
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();

  // Create submissions directory if it doesn't exist
  if (!existsSync(SUBMISSIONS_DIR)) {
    await mkdir(SUBMISSIONS_DIR, { recursive: true });
  }

  // Save uploaded files
  let cvFileName: string | undefined;
  let coverLetterFileName: string | undefined;

  if (data.cvFile && data.cvFile.size > 0) {
    const cvBuffer = Buffer.from(await data.cvFile.arrayBuffer());
    const ext = data.cvFile.name.split(".").pop();
    cvFileName = `${submissionId}_cv.${ext}`;
    await writeFile(join(SUBMISSIONS_DIR, cvFileName), cvBuffer);
  }

  if (data.coverLetterFile && data.coverLetterFile.size > 0) {
    const clBuffer = Buffer.from(await data.coverLetterFile.arrayBuffer());
    const ext = data.coverLetterFile.name.split(".").pop();
    coverLetterFileName = `${submissionId}_coverletter.${ext}`;
    await writeFile(join(SUBMISSIONS_DIR, coverLetterFileName), clBuffer);
  }

  // Create submission record
  const submission: IntakeSubmission = {
    id: submissionId,
    timestamp,
    fullName: data.fullName,
    email: data.email,
    linkedinUrl: data.linkedinUrl || undefined,
    industries: data.industries,
    jobTitles: data.jobTitles,
    careerStage: data.careerStage,
    timeline: data.timeline,
    location: data.location,
    currentRole: data.currentRole,
    achievements: data.achievements,
    challenges: data.challenges,
    additionalContext: data.additionalContext || undefined,
    hasCoverLetter: data.hasCoverLetter,
    certifications: data.certifications || undefined,
    tools: data.tools || undefined,
    cvFileName,
    coverLetterFileName,
    status: "pending",
  };

  // Save submission to JSON file
  const submissionPath = join(SUBMISSIONS_DIR, `${submissionId}.json`);
  await writeFile(submissionPath, JSON.stringify(submission, null, 2));

  // Send confirmation email and get order URL
  const { success: emailSent, orderUrl } = await sendOrderConfirmationEmail(data.email, data.fullName, submissionId);

  console.log("New intake submission (JSON):", {
    id: submissionId,
    email: data.email,
    fullName: data.fullName,
    paymentVerified: data.verifiedPayment,
    emailSent,
  });

  return NextResponse.json({
    success: true,
    submissionId,
    orderUrl,
    message: "Your CV revamp request has been submitted successfully!",
  });
}
