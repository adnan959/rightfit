"use client";

import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepTitles = [
  "Let's Get Started",
  "Drop Your CV",
  "Where Are You Headed?",
  "Timeline & Location",
  "Tell Me About Your Work",
  "What's Been Hard?",
  "Extra Materials",
  "Review & Pay",
];

export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-navy">
          {stepTitles[currentStep - 1]}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
