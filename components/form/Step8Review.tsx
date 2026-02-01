"use client";

import { UseFormReturn } from "react-hook-form";
import { IntakeFormData, industryOptions, careerStageOptions, timelineOptions } from "@/lib/form-schema";
import { Check, FileText, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step8Props {
  form: UseFormReturn<IntakeFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function Step8Review({ form, onSubmit, isSubmitting }: Step8Props) {
  const { watch } = form;
  const data = watch();

  const getIndustryLabels = () => {
    return data.industries
      ?.map((i) => industryOptions.find((opt) => opt.value === i)?.label)
      .filter(Boolean)
      .join(", ");
  };

  const getCareerStageLabel = () => {
    return careerStageOptions.find((opt) => opt.value === data.careerStage)
      ?.label;
  };

  const getTimelineLabel = () => {
    return timelineOptions.find((opt) => opt.value === data.timeline)?.label;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">Review & Pay</h2>
        <p className="text-muted-foreground">
          You&apos;re all set. Here&apos;s a quick summary.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name</span>
            <p className="font-medium text-navy">{data.fullName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium text-navy">{data.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industries</span>
            <p className="font-medium text-navy">{getIndustryLabels()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Target Roles</span>
            <p className="font-medium text-navy truncate">{data.jobTitles}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Career Stage</span>
            <p className="font-medium text-navy">{getCareerStageLabel()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Timeline</span>
            <p className="font-medium text-navy">{getTimelineLabel()}</p>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-secondary rounded-xl p-6">
        <h3 className="font-semibold text-navy mb-4">
          Here&apos;s what happens next:
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
              <span className="text-coral text-sm font-semibold">1</span>
            </div>
            <p className="text-navy-light">
              I review your CV and details
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
              <span className="text-coral text-sm font-semibold">2</span>
            </div>
            <p className="text-navy-light">
              I rewrite it to be clear, scannable, impact-first
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
              <span className="text-coral text-sm font-semibold">3</span>
            </div>
            <p className="text-navy-light">
              You get it in your inbox within 48-96 hours
            </p>
          </div>
        </div>
      </div>

      {/* Price and CTA */}
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-coral">$30</div>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="bg-coral hover:bg-coral-dark text-white px-10 py-6 text-xl rounded-full shadow-warm transition-all hover:scale-105 w-full sm:w-auto"
        >
          {isSubmitting ? "Processing..." : "Start My CV Revamp"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Questions? Reach out at hello@applybetter.com
        </p>
      </div>
    </div>
  );
}
