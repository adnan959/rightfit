"use client";

import { CVGradeResult } from "@/lib/cv-reviewer-skill";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface GradeResultsProps {
  result: CVGradeResult;
  isBasic: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-yellow-500";
  return "text-coral";
}

function getScoreIcon(score: number) {
  if (score >= 75) return <CheckCircle className="w-5 h-5 text-success" />;
  if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-coral" />;
}

export function GradeResults({ result, isBasic }: GradeResultsProps) {
  const categories = [
    { key: "clarity", label: "Clarity", score: result.breakdown.clarity },
    {
      key: "impactEvidence",
      label: "Impact Evidence",
      score: result.breakdown.impactEvidence,
    },
    {
      key: "scannability",
      label: "Scannability",
      score: result.breakdown.scannability,
    },
    { key: "atsSafety", label: "ATS Safety", score: result.breakdown.atsSafety },
    {
      key: "firstImpression",
      label: "First Impression",
      score: result.breakdown.firstImpression,
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Overall Score */}
      <div className="text-center p-6 bg-secondary rounded-xl">
        <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
          {result.overallScore}
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              result.overallScore >= 75
                ? "bg-success/10 text-success"
                : result.overallScore >= 60
                ? "bg-yellow-500/10 text-yellow-600"
                : "bg-coral/10 text-coral"
            }`}
          >
            {result.label}
          </span>
        </div>
        <p className="mt-3 text-navy-light">{result.summary}</p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold text-navy">Score Breakdown</h3>
        {categories.map((category) => (
          <div key={category.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-navy-light">{category.label}</span>
              <span className={`font-medium ${getScoreColor(category.score)}`}>
                {category.score}
              </span>
            </div>
            <Progress
              value={category.score}
              className="h-2"
            />
          </div>
        ))}
      </div>

      {/* Top Issues */}
      <div className="space-y-3">
        <h3 className="font-semibold text-navy">Top Issues to Fix</h3>
        <ul className="space-y-2">
          {result.topIssues.map((issue, index) => (
            <li
              key={index}
              className="flex items-start gap-2 p-3 bg-coral/5 rounded-lg border border-coral/10"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center text-xs font-semibold text-coral">
                {index + 1}
              </span>
              <span className="text-navy-light text-sm">{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Analysis (Full Report Only) */}
      {!isBasic && result.detailedAnalysis && (
        <div className="space-y-4">
          <h3 className="font-semibold text-navy">Detailed Analysis</h3>
          {categories.map((category) => {
            const analysis =
              result.detailedAnalysis?.[
                category.key as keyof typeof result.detailedAnalysis
              ];
            if (!analysis) return null;

            return (
              <div
                key={category.key}
                className="p-4 bg-white rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  {getScoreIcon(category.score)}
                  <h4 className="font-medium text-navy">{category.label}</h4>
                  <span
                    className={`ml-auto text-sm font-medium ${getScoreColor(
                      category.score
                    )}`}
                  >
                    {category.score}/100
                  </span>
                </div>
                <p className="text-sm text-navy-light">{analysis}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations (Full Report Only) */}
      {!isBasic && result.recommendations && result.recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-navy">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 p-3 bg-success/5 rounded-lg border border-success/10"
              >
                <CheckCircle className="flex-shrink-0 w-4 h-4 text-success mt-0.5" />
                <span className="text-navy-light text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
