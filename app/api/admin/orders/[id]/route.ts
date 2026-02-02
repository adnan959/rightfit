import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured, getSignedUrl, CV_STORAGE_BUCKET } from "@/lib/supabase";
import { getResend, isResendConfigured, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { getCVDeliveryEmail } from "@/lib/email-templates";
import { generateOrderUrl } from "@/lib/order-tokens";
import type { SubmissionStatus } from "@/lib/db/types";

// Helper to send delivery email
async function sendDeliveryEmail(
  email: string,
  name: string,
  orderId: string,
  downloadUrl: string
): Promise<boolean> {
  if (!isResendConfigured()) {
    console.log("Resend not configured, skipping delivery email");
    return false;
  }

  try {
    const resend = getResend();
    // Use lowercase email for token generation to match DB storage
    const orderUrl = generateOrderUrl(orderId, email.toLowerCase());
    const emailContent = getCVDeliveryEmail({
      customerName: name,
      customerEmail: email,
      orderId,
      downloadUrl,
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
      console.error("Failed to send delivery email:", error);
      return false;
    }

    console.log("Delivery email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending delivery email:", error);
    return false;
  }
}

// Helper to log activity
async function logActivity(submissionId: string, action: string, description?: string) {
  if (!supabaseAdmin) return;
  
  try {
    await supabaseAdmin.from('activity_log').insert({
      submission_id: submissionId,
      action,
      description,
      actor: 'admin',
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    // Fetch submission with relations
    const { data: order, error } = await supabaseAdmin
      .from("submissions")
      .select(`
        *,
        ai_grades (*),
        payments (*),
        review_notes (*),
        activity_log (*)
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Generate signed URLs for files
    const fileUrls: Record<string, string | null> = {
      cv: null,
      coverLetter: null,
      rewrittenCv: null,
    };

    if (order.cv_file_path) {
      const { url } = await getSignedUrl(CV_STORAGE_BUCKET, order.cv_file_path);
      fileUrls.cv = url || null;
    }
    if (order.cover_letter_file_path) {
      const { url } = await getSignedUrl(CV_STORAGE_BUCKET, order.cover_letter_file_path);
      fileUrls.coverLetter = url || null;
    }
    if (order.rewritten_cv_path) {
      const { url } = await getSignedUrl(CV_STORAGE_BUCKET, order.rewritten_cv_path);
      fileUrls.rewrittenCv = url || null;
    }

    return NextResponse.json({
      success: true,
      order,
      fileUrls,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get the current order first
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = currentOrder.status;
    const newStatus = body.status as SubmissionStatus | undefined;

    // Build update object
    const updateData: Record<string, unknown> = {};
    
    if (body.status) {
      updateData.status = body.status;
      
      // Set timestamps based on status
      if (body.status === "completed" && !currentOrder.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
      if (body.status === "delivered" && !currentOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    if (body.priority) updateData.priority = body.priority;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.rewritten_cv_path !== undefined) updateData.rewritten_cv_path = body.rewritten_cv_path;

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Log status change
    if (newStatus && newStatus !== previousStatus) {
      await logActivity(id, `Status changed to ${newStatus}`, `Status updated from ${previousStatus} to ${newStatus}`);
    }

    // Send delivery email if status changed to "delivered"
    if (newStatus === "delivered" && previousStatus !== "delivered") {
      // Get the download URL for the rewritten CV
      let downloadUrl = "";
      if (updatedOrder.rewritten_cv_path) {
        const { url } = await getSignedUrl(CV_STORAGE_BUCKET, updatedOrder.rewritten_cv_path, 604800); // 7 days
        if (url) {
          downloadUrl = url;
        }
      }

      if (downloadUrl) {
        const emailSent = await sendDeliveryEmail(
          currentOrder.email,
          currentOrder.full_name,
          id,
          downloadUrl
        );

        if (emailSent) {
          await logActivity(id, "Delivery email sent", `CV delivered to ${currentOrder.email}`);
        }
      } else {
        console.warn("No rewritten CV path found, skipping delivery email");
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
