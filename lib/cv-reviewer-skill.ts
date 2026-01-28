/**
 * CV Reviewer Skill - Grading prompt and logic
 * Based on the CV Reviewer Skill file at ~/.cursor/skills-cursor/cv-reviewer/SKILL.md
 */

export interface CVGradeResult {
  overallScore: number;
  label: string;
  summary: string;
  breakdown: {
    clarity: number;
    impactEvidence: number;
    scannability: number;
    atsSafety: number;
    firstImpression: number;
  };
  topIssues: string[];
  detailedAnalysis?: {
    clarity: string;
    impactEvidence: string;
    scannability: string;
    atsSafety: string;
    firstImpression: string;
  };
  recommendations?: string[];
}

/**
 * Get the grading label based on score
 */
export function getGradeLabel(score: number): string {
  if (score >= 90) return "Interview Ready";
  if (score >= 75) return "Good Foundation";
  if (score >= 60) return "Needs Work";
  if (score >= 40) return "Major Rewrite";
  return "Start Fresh";
}

/**
 * Build the CV grading prompt
 */
export function buildGradingPrompt(
  cvText: string,
  targetRole?: string,
  fullAnalysis: boolean = false
): string {
  const basePrompt = `You are a senior CV reviewer with 20+ years of recruitment experience across Fortune 500 companies. Your approach is direct, honest, and helpful.

## The Recruiter's Reality
Recruiters scan CVs in under 10 seconds trying to answer:
1. What do you do?
2. What level are you?
3. What did you actually improve?
4. What impact did you make?
5. Should I keep reading?

## Evaluation Criteria (weighted)
1. **Clarity (25%)** - Can I tell what this person does in 5 seconds? Is the target role obvious?
2. **Impact Evidence (25%)** - Outcomes vs duties? Quantified? Ownership language?
3. **Scannability (20%)** - Clean structure? Appropriate length? Strong bullet openings?
4. **ATS Safety (15%)** - Standard formatting? No design elements that break parsing?
5. **First Impression (15%)** - Professional summary hooks? Most impressive work visible early?

## Grading Rubric
- 90-100: Interview Ready - Minor tweaks only
- 75-89: Good Foundation - Clear strengths, specific improvements needed
- 60-74: Needs Work - Significant gaps
- 40-59: Major Rewrite - Core problems
- 0-39: Start Fresh - Fundamental issues

## CV to Review:
${cvText}

${targetRole ? `## Target Role/Industry: ${targetRole}` : ""}

## Your Task:
Analyze this CV and provide a structured assessment.`;

  if (fullAnalysis) {
    return `${basePrompt}

Respond in JSON format:
{
  "overallScore": <number 0-100>,
  "summary": "<one sentence overall assessment>",
  "breakdown": {
    "clarity": <number 0-100>,
    "impactEvidence": <number 0-100>,
    "scannability": <number 0-100>,
    "atsSafety": <number 0-100>,
    "firstImpression": <number 0-100>
  },
  "topIssues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "detailedAnalysis": {
    "clarity": "<detailed analysis of clarity>",
    "impactEvidence": "<detailed analysis of impact evidence>",
    "scannability": "<detailed analysis of scannability>",
    "atsSafety": "<detailed analysis of ATS safety>",
    "firstImpression": "<detailed analysis of first impression>"
  },
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>",
    "<specific actionable recommendation 4>",
    "<specific actionable recommendation 5>"
  ]
}`;
  } else {
    return `${basePrompt}

Respond in JSON format (basic assessment only):
{
  "overallScore": <number 0-100>,
  "summary": "<one sentence overall assessment>",
  "breakdown": {
    "clarity": <number 0-100>,
    "impactEvidence": <number 0-100>,
    "scannability": <number 0-100>,
    "atsSafety": <number 0-100>,
    "firstImpression": <number 0-100>
  },
  "topIssues": ["<issue 1>", "<issue 2>", "<issue 3>"]
}`;
  }
}

/**
 * Parse the grading response from OpenAI
 */
export function parseGradingResponse(response: string): CVGradeResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find raw JSON
      const startIndex = response.indexOf("{");
      const endIndex = response.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = response.substring(startIndex, endIndex + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);

    return {
      overallScore: parsed.overallScore,
      label: getGradeLabel(parsed.overallScore),
      summary: parsed.summary,
      breakdown: parsed.breakdown,
      topIssues: parsed.topIssues,
      detailedAnalysis: parsed.detailedAnalysis,
      recommendations: parsed.recommendations,
    };
  } catch (error) {
    console.error("Error parsing grading response:", error);
    throw new Error("Failed to parse CV grading response");
  }
}
