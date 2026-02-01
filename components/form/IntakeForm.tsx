"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FormProgress } from "./FormProgress";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2CVUpload } from "./Step2CVUpload";
import { Step3CareerGoals } from "./Step3CareerGoals";
import { Step4Timeline } from "./Step4Timeline";
import { Step5Experience } from "./Step5Experience";
import { Step6Challenges } from "./Step6Challenges";
import { Step7Extras } from "./Step7Extras";
import { Step8Review } from "./Step8Review";
import {
  intakeFormSchema,
  IntakeFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from "@/lib/form-schema";

const TOTAL_STEPS = 8;

// Validation schemas per step
const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  null, // Step 8 is review, no additional validation
];

export function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      linkedinUrl: "",
      industries: [],
      jobTitles: "",
      careerStage: undefined,
      timeline: undefined,
      location: "",
      currentRole: "",
      achievements: "",
      challenges: [],
      additionalContext: "",
      hasCoverLetter: undefined,
      certifications: "",
      tools: "",
    },
    mode: "onTouched",
  });

  const validateCurrentStep = async () => {
    const schema = stepSchemas[currentStep - 1];
    if (!schema) return true;

    const fieldsToValidate = Object.keys(schema.shape);
    const result = await form.trigger(fieldsToValidate as (keyof IntakeFormData)[]);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < TOTAL_STEPS) {
      // Capture lead when moving from Step 1 to Step 2
      if (currentStep === 1 && !leadCaptured) {
        const { email, fullName } = form.getValues();
        if (email) {
          try {
            await fetch("/api/capture-lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                source: "form_step1",
                metadata: { fullName },
              }),
            });
            setLeadCaptured(true);
          } catch (error) {
            // Don't block form progression if lead capture fails
            console.error("Failed to capture lead:", error);
          }
        }
      }

      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (paymentIntentId: string) => {
    setIsSubmitting(true);
    try {
      const data = form.getValues();
      
      // Create FormData for file uploads
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add payment intent ID
      if (paymentIntentId) {
        formData.append("paymentIntentId", paymentIntentId);
      }

      // Submit to API
      const response = await fetch("/api/submit-intake", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Redirect to order confirmation page
        if (responseData.orderUrl) {
          window.location.href = responseData.orderUrl;
        } else {
          // Fallback to order page without token
          window.location.href = `/order/${responseData.submissionId}`;
        }
      } else {
        throw new Error(responseData.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your request. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo form={form} />;
      case 2:
        return <Step2CVUpload form={form} />;
      case 3:
        return <Step3CareerGoals form={form} />;
      case 4:
        return <Step4Timeline form={form} />;
      case 5:
        return <Step5Experience form={form} />;
      case 6:
        return <Step6Challenges form={form} />;
      case 7:
        return <Step7Extras form={form} />;
      case 8:
        return (
          <Step8Review
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FormProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="bg-white rounded-2xl shadow-soft border border-border p-6 md:p-8">
        {renderStep()}

        {/* Navigation buttons */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-coral hover:bg-coral-dark text-white gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
