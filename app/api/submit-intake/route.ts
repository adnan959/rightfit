import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Store submissions in a JSON file (MVP approach - upgrade to database later)
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

    // Extract files
    const cvFile = formData.get("cvFile") as File | null;
    const coverLetterFile = formData.get("coverLetterFile") as File | null;

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

    if (cvFile && cvFile.size > 0) {
      const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
      const ext = cvFile.name.split(".").pop();
      cvFileName = `${submissionId}_cv.${ext}`;
      await writeFile(join(SUBMISSIONS_DIR, cvFileName), cvBuffer);
    }

    if (coverLetterFile && coverLetterFile.size > 0) {
      const clBuffer = Buffer.from(await coverLetterFile.arrayBuffer());
      const ext = coverLetterFile.name.split(".").pop();
      coverLetterFileName = `${submissionId}_coverletter.${ext}`;
      await writeFile(join(SUBMISSIONS_DIR, coverLetterFileName), clBuffer);
    }

    // Create submission record
    const submission: IntakeSubmission = {
      id: submissionId,
      timestamp,
      fullName,
      email,
      linkedinUrl: linkedinUrl || undefined,
      industries,
      jobTitles,
      careerStage,
      timeline,
      location,
      currentRole,
      achievements,
      challenges,
      additionalContext: additionalContext || undefined,
      hasCoverLetter,
      certifications: certifications || undefined,
      tools: tools || undefined,
      cvFileName,
      coverLetterFileName,
      status: "pending",
    };

    // Save submission to JSON file
    const submissionPath = join(SUBMISSIONS_DIR, `${submissionId}.json`);
    await writeFile(submissionPath, JSON.stringify(submission, null, 2));

    // Log for debugging
    console.log("New intake submission:", {
      id: submissionId,
      email,
      fullName,
    });

    return NextResponse.json({
      success: true,
      submissionId,
      message: "Your CV revamp request has been submitted successfully!",
    });
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
