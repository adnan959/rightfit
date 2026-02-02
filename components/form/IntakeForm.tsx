"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FormProgress } from "./FormProgress";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { CheckoutPayment } from "./CheckoutPayment";

// Simplified checkout schema - just name and email
const checkoutSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

const TOTAL_STEPS = 2;

export function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
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

      // Submit minimal data to create order
      const response = await fetch("/api/submit-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          paymentIntentId,
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Redirect to order completion page to collect details
        if (responseData.completeUrl) {
          window.location.href = responseData.completeUrl;
        } else if (responseData.orderUrl) {
          window.location.href = responseData.orderUrl;
        } else {
          window.location.href = `/order/${responseData.submissionId}/complete`;
        }
      } else {
        throw new Error(responseData.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`There was an error submitting your request: ${errorMessage}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo form={form} />;
      case 2:
        return (
          <CheckoutPayment
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

        {/* Navigation buttons - only show on step 1 */}
        {currentStep === 1 && (
          <div className="flex justify-end mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={handleNext}
              className="bg-coral hover:bg-coral-dark text-white gap-2"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Back button on payment step */}
        {currentStep === 2 && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
