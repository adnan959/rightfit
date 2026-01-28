import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_MODEL, MAX_TOKENS } from "@/lib/openai";
import { parseCV, cleanCVText } from "@/lib/cv-parser";
import {
  buildGradingPrompt,
  parseGradingResponse,
  CVGradeResult,
  getGradeLabel,
} from "@/lib/cv-reviewer-skill";

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    const targetRole = formData.get("targetRole") as string | null;
    const fullAnalysis = formData.get("fullAnalysis") === "true";

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

    // Check if OpenAI API key is configured
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    if (!hasApiKey) {
      // Return simulated results for demo mode
      console.log("Demo mode: Returning simulated CV grade (no API key configured)");
      
      // Simulate a brief delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      return NextResponse.json({
        success: true,
        grade: getSimulatedGrade(fullAnalysis),
        demo: true,
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

    return NextResponse.json({
      success: true,
      grade: gradeResult,
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
