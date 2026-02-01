"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { IntakeFormData, industryOptions, careerStageOptions, timelineOptions } from "@/lib/form-schema";
import { Check, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Step8Props {
  form: UseFormReturn<IntakeFormData>;
  onSubmit: (paymentIntentId: string) => void;
  isSubmitting: boolean;
}

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

function PaymentForm({ onPaymentSuccess, isSubmitting, setIsSubmitting }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/form?success=true`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Payment failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError("Payment was not completed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-border p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={!stripe || isSubmitting}
        size="lg"
        className="bg-coral hover:bg-coral-dark text-white px-10 py-6 text-xl rounded-full shadow-warm transition-all hover:scale-105 w-full"
      >
        <Lock className="w-5 h-5 mr-2" />
        {isSubmitting ? "Processing..." : "Pay $30 & Submit"}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secure payment powered by Stripe
      </p>
    </div>
  );
}

export function Step8Review({ form, onSubmit, isSubmitting }: Step8Props) {
  const { watch } = form;
  const data = watch();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(isSubmitting);

  // Create PaymentIntent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            name: data.fullName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initialize payment");
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setPaymentError(
          err instanceof Error ? err.message : "Failed to initialize payment. Please refresh and try again."
        );
      } finally {
        setIsLoadingPayment(false);
      }
    };

    if (data.email) {
      createPaymentIntent();
    }
  }, [data.email, data.fullName]);

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

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSubmit(paymentIntentId);
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

      {/* Price */}
      <div className="text-center">
        <div className="text-4xl font-bold text-coral mb-4">$30</div>
      </div>

      {/* Payment Section */}
      {isLoadingPayment ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment form...</p>
        </div>
      ) : paymentError ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{paymentError}</span>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      ) : clientSecret && stripePromise ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#FF6B6B",
                borderRadius: "8px",
              },
            },
          }}
        >
          <PaymentForm
            onPaymentSuccess={handlePaymentSuccess}
            isSubmitting={localIsSubmitting}
            setIsSubmitting={setLocalIsSubmitting}
          />
        </Elements>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Payment processing is not available at the moment.
          </p>
          <Button
            onClick={() => onSubmit("")}
            disabled={isSubmitting}
            size="lg"
            className="bg-coral hover:bg-coral-dark text-white px-10 py-6 text-xl rounded-full"
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
          </Button>
        </div>
      )}

      <p className="text-sm text-center text-muted-foreground">
        Questions? Reach out at hello@applybetter.com
      </p>
    </div>
  );
}
