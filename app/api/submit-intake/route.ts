import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getStripe, isStripeConfigured, CV_REWRITE_PRICE } from "@/lib/stripe";
import { getResend, isResendConfigured, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { getOrderConfirmationEmail } from "@/lib/email-templates";
import { generateOrderUrl, generateOrderToken } from "@/lib/order-tokens";

// Fallback: Store submissions in JSON files (when Supabase is not configured)
// On Vercel, use /tmp directory since the file system is read-only
const SUBMISSIONS_DIR = process.env.VERCEL 
  ? join("/tmp", "submissions")
  : join(process.cwd(), "data", "submissions");

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
  orderId: string,
  baseUrl: string,
  completeUrl: string
): Promise<{ success: boolean; orderUrl: string }> {
  // IMPORTANT: Use lowercase email for token generation to match how we store it in DB
  const orderUrl = generateOrderUrl(orderId, email.toLowerCase(), baseUrl);
  
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
      completeUrl, // Pass the completion URL
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
    // Get base URL from request headers for proper URL generation
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    
    // Accept JSON body for simplified checkout
    const body = await request.json();
    const { fullName, email, paymentIntentId } = body;

    // Validate required fields - only name and email now
    if (!fullName || !email) {
      const missingFields = [];
      if (!fullName) missingFields.push('fullName');
      if (!email) missingFields.push('email');
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}`, success: false },
        { status: 400 }
      );
    }

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
            { error: "Payment not completed. Please try again.", success: false },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
          { error: "Failed to verify payment", success: false },
          { status: 400 }
        );
      }
    }

    // Use Supabase if configured, otherwise fall back to JSON files
    if (isSupabaseConfigured() && supabaseAdmin) {
      return await handleSupabaseSubmission({
        fullName,
        email,
        paymentIntentId,
        verifiedPayment,
        baseUrl,
      });
    } else {
      return await handleJsonSubmission({
        fullName,
        email,
        paymentIntentId,
        verifiedPayment,
        baseUrl,
      });
    }
  } catch (error) {
    console.error("Error processing intake submission:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process submission";
    console.error("Error details:", { message: errorMessage });
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}

// Handle submission with Supabase - minimal data, pending_details status
async function handleSupabaseSubmission(data: {
  fullName: string;
  email: string;
  paymentIntentId: string | null;
  verifiedPayment: boolean;
  baseUrl: string;
}) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  // Create minimal submission record with pending_details status
  const submissionData = {
    status: 'pending_details' as const, // Customer needs to provide CV and details
    priority: 'normal' as const,
    full_name: data.fullName,
    email: data.email.toLowerCase(),
    // All other fields are optional and will be filled in later
    linkedin_url: null,
    industries: [],
    job_titles: '', // Will be required when completing order
    career_stage: null,
    timeline: null,
    location: '',
    current_role: null,
    achievements: null,
    challenges: [],
    additional_context: null,
    has_cover_letter: null,
    certifications: null,
    tools: null,
    cv_file_path: null,
    cover_letter_file_path: null,
    rewritten_cv_path: null,
    assigned_to: null,
    due_date: null, // Will be set when order is completed
    completed_at: null,
    delivered_at: null,
  };

  // Insert submission
  console.log("Creating pending_details submission:", { email: data.email, fullName: data.fullName });
  const { data: submission, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert(submissionData)
    .select()
    .single();

  if (insertError || !submission) {
    console.error("Supabase insert error:", insertError);
    throw new Error(`Failed to create submission: ${insertError?.message || 'Unknown error'}`);
  }
  console.log("Submission created successfully:", submission.id);

  const submissionId = submission.id;

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
  await logActivity(submissionId, 'Order created', `New order from ${data.fullName} (${data.email}) - awaiting details`);

  // Generate completion URL with token
  const token = generateOrderToken(submissionId, data.email.toLowerCase());
  const completeUrl = `${data.baseUrl}/order/${submissionId}/complete?token=${token}`;
  const orderUrl = generateOrderUrl(submissionId, data.email.toLowerCase(), data.baseUrl);

  // Send confirmation email
  const { success: emailSent } = await sendOrderConfirmationEmail(
    data.email, 
    data.fullName, 
    submissionId, 
    data.baseUrl,
    completeUrl
  );
  if (emailSent) {
    await logActivity(submissionId, 'Confirmation email sent', `Email sent to ${data.email}`);
  }

  console.log("New intake submission (Supabase):", {
    id: submissionId,
    email: data.email,
    fullName: data.fullName,
    status: 'pending_details',
    paymentVerified: data.verifiedPayment,
    emailSent,
  });

  return NextResponse.json({
    success: true,
    submissionId,
    orderUrl,
    completeUrl, // Redirect user here to complete their order
    message: "Payment received! Please complete your order details.",
  });
}

// Fallback: Handle submission with JSON files
async function handleJsonSubmission(data: {
  fullName: string;
  email: string;
  paymentIntentId: string | null;
  verifiedPayment: boolean;
  baseUrl: string;
}) {
  // Generate submission ID
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();

  // Create submissions directory if it doesn't exist
  if (!existsSync(SUBMISSIONS_DIR)) {
    await mkdir(SUBMISSIONS_DIR, { recursive: true });
  }

  // Create minimal submission record
  const submission = {
    id: submissionId,
    timestamp,
    status: "pending_details",
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    paymentVerified: data.verifiedPayment,
    paymentIntentId: data.paymentIntentId,
    // These will be filled in later
    industries: [],
    jobTitles: "",
    careerStage: "",
    timeline: "",
    location: "",
    currentRole: "",
    achievements: "",
    challenges: [],
  };

  // Save submission to JSON file
  const submissionPath = join(SUBMISSIONS_DIR, `${submissionId}.json`);
  await writeFile(submissionPath, JSON.stringify(submission, null, 2));

  // Generate URLs
  const token = generateOrderToken(submissionId, data.email.toLowerCase());
  const completeUrl = `${data.baseUrl}/order/${submissionId}/complete?token=${token}`;
  const orderUrl = generateOrderUrl(submissionId, data.email.toLowerCase(), data.baseUrl);

  // Send confirmation email
  const { success: emailSent } = await sendOrderConfirmationEmail(
    data.email, 
    data.fullName, 
    submissionId, 
    data.baseUrl,
    completeUrl
  );

  console.log("New intake submission (JSON):", {
    id: submissionId,
    email: data.email,
    fullName: data.fullName,
    status: 'pending_details',
    paymentVerified: data.verifiedPayment,
    emailSent,
  });

  return NextResponse.json({
    success: true,
    submissionId,
    orderUrl,
    completeUrl,
    message: "Payment received! Please complete your order details.",
  });
}
