import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { LeadInsert, LeadSource } from "@/lib/db/types";

// Fallback: Store leads in a JSON file (when Supabase is not configured)
const LEADS_DIR = join(process.cwd(), "data");
const LEADS_FILE = join(LEADS_DIR, "leads.json");

interface Lead {
  id: string;
  email: string;
  source: "free_audit" | "newsletter" | "other";
  cvGradeScore?: number;
  timestamp: string;
  converted: boolean;
}

async function getLeads(): Promise<Lead[]> {
  try {
    if (!existsSync(LEADS_FILE)) {
      return [];
    }
    const data = await readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveLeads(leads: Lead[]): Promise<void> {
  if (!existsSync(LEADS_DIR)) {
    await mkdir(LEADS_DIR, { recursive: true });
  }
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Map old source types to new enum
function mapSourceToEnum(source: string): LeadSource {
  switch (source) {
    case 'free_audit':
      return 'audit_modal';
    case 'form_abandon':
      return 'form_abandon';
    case 'form_step1':
      return 'form_step1';
    default:
      return 'direct';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "free_audit", cvGradeScore, cvFilePath } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Use Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      return await handleSupabaseLead(email, source, cvGradeScore, cvFilePath);
    } else {
      return await handleJsonLead(email, source, cvGradeScore);
    }
  } catch (error) {
    console.error("Error capturing lead:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to capture lead",
      },
      { status: 500 }
    );
  }
}

// Handle lead capture with Supabase
async function handleSupabaseLead(
  email: string,
  source: string,
  cvGradeScore?: number,
  cvFilePath?: string
) {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const normalizedEmail = email.toLowerCase();
  const leadSource = mapSourceToEnum(source);

  // Check if email already exists
  const { data: existingLead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  if (existingLead) {
    // Update existing lead
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        cv_file_path: cvFilePath || existingLead.cv_file_path,
      })
      .eq('id', existingLead.id);

    if (updateError) {
      console.error("Failed to update lead:", updateError);
    }

    console.log("Lead updated (Supabase):", { email: normalizedEmail, source: leadSource });

    return NextResponse.json({
      success: true,
      message: "Email captured successfully",
      isExisting: true,
    });
  }

  // Create new lead
  const leadData: LeadInsert = {
    email: normalizedEmail,
    source: leadSource,
    cv_file_path: cvFilePath || null,
    converted: false,
    converted_submission_id: null,
    converted_at: null,
  };

  const { error: insertError } = await supabaseAdmin
    .from('leads')
    .insert(leadData);

  if (insertError) {
    console.error("Failed to insert lead:", insertError);
    throw new Error("Failed to capture lead");
  }

  console.log("Lead captured (Supabase):", { email: normalizedEmail, source: leadSource, cvGradeScore });

  return NextResponse.json({
    success: true,
    message: "Email captured successfully",
  });
}

// Fallback: Handle lead capture with JSON files
async function handleJsonLead(
  email: string,
  source: string,
  cvGradeScore?: number
) {
  // Get existing leads
  const leads = await getLeads();
  const normalizedEmail = email.toLowerCase();

  // Check if email already exists
  const existingLead = leads.find(
    (lead) => lead.email.toLowerCase() === normalizedEmail
  );

  if (existingLead) {
    // Update existing lead with new info
    existingLead.cvGradeScore = cvGradeScore ?? existingLead.cvGradeScore;
    existingLead.timestamp = new Date().toISOString();
  } else {
    // Create new lead
    const newLead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: normalizedEmail,
      source: source as "free_audit" | "newsletter" | "other",
      cvGradeScore,
      timestamp: new Date().toISOString(),
      converted: false,
    };
    leads.push(newLead);
  }

  // Save leads
  await saveLeads(leads);

  console.log("Lead captured (JSON):", { email: normalizedEmail, source, cvGradeScore });

  return NextResponse.json({
    success: true,
    message: "Email captured successfully",
  });
}

export async function GET() {
  try {
    // Use Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data: leads, error, count } = await supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        count: count || leads?.length || 0,
        leads: leads || [],
      });
    }

    // Fallback to JSON
    const leads = await getLeads();
    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
