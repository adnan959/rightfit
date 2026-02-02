"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Target,
  MapPin,
  Clock,
  Award,
  AlertCircle,
  Wrench,
  FileText,
} from "lucide-react";
import type { SubmissionWithRelations } from "@/lib/db/types";
import { CAREER_STAGE_LABELS, TIMELINE_LABELS } from "@/lib/db/types";
import { challengeOptions, industryOptions } from "@/lib/form-schema";
import { PDFPreview } from "./PDFPreview";

interface SubmissionCardProps {
  order: SubmissionWithRelations;
  showPreview?: boolean;
}

export function SubmissionCard({ order, showPreview = true }: SubmissionCardProps) {
  const getIndustryLabel = (value: string) => {
    const option = industryOptions.find((o) => o.value === value);
    return option?.label || value;
  };

  const getChallengeLabel = (value: string) => {
    const option = challengeOptions.find((o) => o.value === value);
    return option?.label || value;
  };

  // Get file name from path
  const cvFileName = order.cv_file_path?.split("/").pop() || "Original CV";

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <FileText className="h-3.5 w-3.5" />
          Submission Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`flex gap-4 ${showPreview ? "flex-col lg:flex-row" : ""}`}>
          {/* Left Column - Content (60%) */}
          <div className={`${showPreview ? "lg:w-[60%]" : "w-full"} space-y-3`}>
            {/* Target Role */}
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                <Target className="h-4 w-4" />
                Target Role
              </div>
              <p className="text-gray-900 font-medium">{order.job_titles}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {order.industries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="bg-coral-50 text-coral-700">
                    {getIndustryLabel(ind)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Role */}
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                <Briefcase className="h-4 w-4" />
                Current Role
              </div>
              <p className="text-gray-900 text-sm">{order.current_job_role || "Not specified"}</p>
              <p className="text-xs text-gray-500 mt-1">
                {CAREER_STAGE_LABELS[order.career_stage]}
              </p>
            </div>

            {/* Timeline & Location */}
            <div className="flex gap-6">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Clock className="h-4 w-4" />
                  Timeline
                </div>
                <p className="text-gray-900 text-sm">{TIMELINE_LABELS[order.timeline]}</p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <p className="text-gray-900 text-sm">{order.location}</p>
              </div>
            </div>

            {/* Achievements */}
            {order.achievements && (
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Award className="h-4 w-4" />
                  Key Achievements
                </div>
                <p className="text-gray-900 text-sm leading-relaxed line-clamp-3">
                  {order.achievements}
                </p>
              </div>
            )}

            {/* Challenges */}
            {order.challenges.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  Challenges
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.challenges.map((ch) => (
                    <Badge key={ch} variant="outline" className="text-xs">
                      {getChallengeLabel(ch)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tools & Certifications */}
            {(order.tools || order.certifications) && (
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Wrench className="h-4 w-4" />
                  Tools & Certifications
                </div>
                {order.certifications && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Certs:</span> {order.certifications}
                  </p>
                )}
                {order.tools && (
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="font-medium">Tools:</span> {order.tools}
                  </p>
                )}
              </div>
            )}

            {/* Additional Context */}
            {order.additional_context && (
              <div className="border-t border-gray-100 pt-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </div>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {order.additional_context}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - CV Preview (40%) */}
          {showPreview && order.cv_file_path && (
            <div className="lg:w-[40%] min-h-[350px]">
              <PDFPreview
                filePath={order.cv_file_path}
                fileName={cvFileName}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
