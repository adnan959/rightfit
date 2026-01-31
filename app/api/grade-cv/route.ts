import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_MODEL, MAX_TOKENS } from "@/lib/openai";
import { parseCV, cleanCVText } from "@/lib/cv-parser";
import {
  buildGradingPrompt,
  parseGradingResponse,
  CVGradeResult,
  getGradeLabel,
} from "@/lib/cv-reviewer-skill";
import { supabaseAdmin, isSupabaseConfigured, uploadFile, CV_STORAGE_BUCKET } from "@/lib/supabase";
import type { AIGradeInsert, AIGradeBreakdown } from "@/lib/db/types";

// Simulated grade result for demo mode (when no API key)
function getSimulatedGrade(fullAnalysis: boolean): CVGradeResult {
  const score = 62;
  const result: CVGradeResult = {
    overallScore: score,
    label: getGradeLabel(score),
    summary:
      "Your CV has solid experience but it's not showing clearly. Recruiters are likely skipping past you because the impact isn't obvious.",
    breakdown: {
      clarity: 70,
      impactEvidence: 45,
      scannability: 75,
      atsSafety: 80,
      firstImpression: 55,
    },
    topIssues: [
      "Your bullets read like a job description, not achievements - they list duties instead of outcomes",
      "No quantified results - impossible to gauge your actual impact without numbers",
      "Summary is too generic and could describe almost anyone in your field",
    ],
  };

  if (fullAnalysis) {
    result.detailedAnalysis = {
      clarity:
        "Your target role is somewhat clear from your job titles, but the summary doesn't specify what level you're targeting or what makes you different. A recruiter has to work to figure out your focus.",
      impactEvidence:
        "Most bullets start with 'Responsible for' or 'Managed' - these are duties, not achievements. There are no numbers, percentages, or concrete outcomes. We can't tell if you managed a team of 2 or 200.",
      scannability:
        "The structure is clean and the length is appropriate. However, bullets don't front-load the important information - the action and result should come first.",
      atsSafety:
        "Good news here - the formatting is clean, you're using standard section headings, and there's no fancy design that would break ATS parsing.",
      firstImpression:
        "The first third of your CV doesn't hook the reader. Your most impressive work appears to be buried in the middle. The summary reads like a template.",
    };
    result.recommendations = [
      "Rewrite every bullet to start with a strong action verb and include a measurable outcome (e.g., 'Reduced customer churn by 23%' instead of 'Managed customer retention')",
      "Add numbers everywhere possible - team size, budget, revenue impact, time saved, percentage improvements",
      "Move your most impressive achievement to the top of each role - don't bury the good stuff",
      "Rewrite your summary to be specific: state your specialty, years of experience, and 1-2 headline achievements",
      "Remove generic phrases like 'results-driven professional' - show results instead of claiming them",
    ];
  }

  return result;
}

// Store AI grade in Supabase
async function storeAIGrade(
  submissionId: string | null,
  gradeResult: CVGradeResult,
  rawResponse?: string
): Promise<void> {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return;
  }

  try {
    const breakdown: AIGradeBreakdown = {
      clarity: gradeResult.breakdown.clarity,
      impact_evidence: gradeResult.breakdown.impactEvidence,
      scannability: gradeResult.breakdown.scannability,
      ats_safety: gradeResult.breakdown.atsSafety,
      first_impression: gradeResult.breakdown.firstImpression,
    };

    const gradeData: AIGradeInsert = {
      submission_id: submissionId,
      overall_score: gradeResult.overallScore,
      label: gradeResult.label,
      breakdown,
      top_issues: gradeResult.topIssues,
      detailed_analysis: gradeResult.detailedAnalysis || null,
      recommendations: gradeResult.recommendations || [],
      raw_response: rawResponse ? { text: rawResponse } : null,
      admin_verified: false,
      admin_notes: null,
    };

    const { error } = await supabaseAdmin.from('ai_grades').insert(gradeData);

    if (error) {
      console.error("Failed to store AI grade:", error);
    }
  } catch (error) {
    console.error("Error storing AI grade:", error);
  }
}

// Store lead CV in Supabase storage for free audits
async function storeLeadCV(
  email: string,
  cvFile: File
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return null;
  }

  try {
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
    const ext = cvFile.name.split(".").pop() || 'pdf';
    const timestamp = Date.now();
    const cvPath = `leads/${timestamp}_${email.replace('@', '_at_')}.${ext}`;

    const { path, error } = await uploadFile(
      CV_STORAGE_BUCKET,
      cvPath,
      cvBuffer,
      cvFile.type
    );

    if (error) {
      console.error("Failed to upload lead CV:", error);
      return null;
    }

    return path;
  } catch (error) {
    console.error("Error uploading lead CV:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    const targetRole = formData.get("targetRole") as string | null;
    const fullAnalysis = formData.get("fullAnalysis") === "true";
    const submissionId = formData.get("submissionId") as string | null;
    const email = formData.get("email") as string | null;

    if (!cvFile) {
      return NextResponse.json(
        { error: "No CV file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(cvFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // Store lead CV if email provided (for free audits)
    let leadCvPath: string | null = null;
    if (email && !submissionId) {
      leadCvPath = await storeLeadCV(email, cvFile);
    }

    // Check if OpenAI API key is configured
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    if (!hasApiKey) {
      // Return simulated results for demo mode
      console.log("Demo mode: Returning simulated CV grade (no API key configured)");
      
      // Simulate a brief delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const grade = getSimulatedGrade(fullAnalysis);
      
      // Store grade in Supabase if configured
      await storeAIGrade(submissionId, grade);
      
      return NextResponse.json({
        success: true,
        grade,
        demo: true,
        leadCvPath,
      });
    }

    // Parse CV
    const cvText = await parseCV(cvFile);
    const cleanedText = cleanCVText(cvText);

    // Check if text is too short
    if (cleanedText.length < 100) {
      return NextResponse.json(
        { error: "CV appears to be too short or empty. Please check the file." },
        { status: 400 }
      );
    }

    // Truncate if too long (to manage token limits)
    const maxChars = 15000;
    const truncatedText =
      cleanedText.length > maxChars
        ? cleanedText.substring(0, maxChars) + "\n\n[CV truncated for analysis]"
        : cleanedText;

    // Build prompt
    const prompt = buildGradingPrompt(
      truncatedText,
      targetRole || undefined,
      fullAnalysis
    );

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert CV reviewer. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse response
    const gradeResult = parseGradingResponse(responseText);

    // Store grade in Supabase if configured
    await storeAIGrade(submissionId, gradeResult, responseText);

    return NextResponse.json({
      success: true,
      grade: gradeResult,
      leadCvPath,
    });
  } catch (error) {
    console.error("Error grading CV:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to grade CV",
      },
      { status: 500 }
    );
  }
}
