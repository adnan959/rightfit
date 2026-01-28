import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Store leads in a JSON file (MVP approach - upgrade to database later)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "free_audit", cvGradeScore } = body;

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

    // Get existing leads
    const leads = await getLeads();

    // Check if email already exists
    const existingLead = leads.find(
      (lead) => lead.email.toLowerCase() === email.toLowerCase()
    );

    if (existingLead) {
      // Update existing lead with new info
      existingLead.cvGradeScore = cvGradeScore ?? existingLead.cvGradeScore;
      existingLead.timestamp = new Date().toISOString();
    } else {
      // Create new lead
      const newLead: Lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: email.toLowerCase(),
        source,
        cvGradeScore,
        timestamp: new Date().toISOString(),
        converted: false,
      };
      leads.push(newLead);
    }

    // Save leads
    await saveLeads(leads);

    console.log("Lead captured:", { email, source, cvGradeScore });

    return NextResponse.json({
      success: true,
      message: "Email captured successfully",
    });
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

export async function GET() {
  try {
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
