"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  industryOptions,
  careerStageOptions,
  timelineOptions,
  challengeOptions,
  coverLetterOptions,
} from "@/lib/form-schema";

// Schema for order completion form
const orderDetailsSchema = z.object({
  cvFile: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "Please upload your CV",
  }),
  linkedinUrl: z.string().optional(),
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  jobTitles: z.string().min(1, "Please enter target job titles"),
  careerStage: z.enum(["student", "recent_graduate", "career_switcher", "currently_working"]),
  timeline: z.enum(["immediately", "1_2_months", "3_4_months", "exploring"]),
  location: z.string().min(1, "Please enter your location"),
  currentRole: z.string().min(10, "Please provide more detail about your role"),
  achievements: z.string().min(10, "Please share your achievements"),
  challenges: z.array(z.string()).min(1, "Please select at least one challenge"),
  additionalContext: z.string().optional(),
  hasCoverLetter: z.enum(["yes", "no", "want_help"]),
  coverLetterFile: z.any().optional(),
  certifications: z.string().optional(),
  tools: z.string().optional(),
});

type OrderDetailsFormData = z.infer<typeof orderDetailsSchema>;

interface OrderData {
  id: string;
  status: string;
  fullName: string;
  email: string;
}

export default function CompleteOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const token = searchParams.get("token");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [coverLetterFileName, setCoverLetterFileName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<OrderDetailsFormData>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
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

  const { register, formState: { errors }, setValue, watch, trigger } = form;
  const watchedIndustries = watch("industries");
  const watchedChallenges = watch("challenges");
  const watchedHasCoverLetter = watch("hasCoverLetter");

  // Fetch order to verify access
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const url = new URL(`/api/order/${id}`, window.location.origin);
        if (token) url.searchParams.set("token", token);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.success) {
          // Check if order already has details
          if (data.order.status !== "pending_details") {
            // Order already completed, redirect to order page
            router.push(`/order/${id}?token=${token}`);
            return;
          }
          setOrder(data.order);
        } else {
          setError(data.error || "Failed to load order");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, router]);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("cvFile", file);
      setCvFileName(file.name);
    }
  };

  const handleCoverLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("coverLetterFile", file);
      setCoverLetterFileName(file.name);
    }
  };

  const toggleIndustry = (value: string) => {
    const current = watchedIndustries || [];
    if (current.includes(value)) {
      setValue("industries", current.filter((i) => i !== value));
    } else {
      setValue("industries", [...current, value]);
    }
  };

  const toggleChallenge = (value: string) => {
    const current = watchedChallenges || [];
    if (current.includes(value)) {
      setValue("challenges", current.filter((c) => c !== value));
    } else {
      setValue("challenges", [...current, value]);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(["cvFile", "linkedinUrl"]);
      case 2:
        return await trigger(["industries", "jobTitles", "careerStage", "timeline", "location"]);
      case 3:
        return await trigger(["currentRole", "achievements", "challenges", "additionalContext"]);
      case 4:
        return await trigger(["hasCoverLetter", "certifications", "tools"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
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

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("token", token || "");
      
      if (data.cvFile instanceof File) {
        formData.append("cvFile", data.cvFile);
      }
      if (data.coverLetterFile instanceof File) {
        formData.append("coverLetterFile", data.coverLetterFile);
      }

      formData.append("linkedinUrl", data.linkedinUrl || "");
      formData.append("industries", JSON.stringify(data.industries));
      formData.append("jobTitles", data.jobTitles);
      formData.append("careerStage", data.careerStage);
      formData.append("timeline", data.timeline);
      formData.append("location", data.location);
      formData.append("currentRole", data.currentRole);
      formData.append("achievements", data.achievements);
      formData.append("challenges", JSON.stringify(data.challenges));
      formData.append("additionalContext", data.additionalContext || "");
      formData.append("hasCoverLetter", data.hasCoverLetter);
      formData.append("certifications", data.certifications || "");
      formData.append("tools", data.tools || "");

      const response = await fetch(`/api/order/${id}/details`, {
        method: "PATCH",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setSubmitSuccess(true);
        // Redirect to order page after brief delay
        setTimeout(() => {
          router.push(`/order/${id}?token=${token}`);
        }, 2000);
      } else {
        throw new Error(responseData.error || "Failed to submit order details");
      }
    } catch (err) {
      console.error("Error submitting details:", err);
      alert(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Unable to Load Order</h1>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find this order. Please check your link."}
            </p>
            <Link href="/order/lookup">
              <Button>Look Up Order</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thanks {order.fullName.split(" ")[0]}! We&apos;ve received all your details and will start working on your CV shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your order page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">ApplyBetter</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete Your Order
          </h1>
          <p className="text-muted-foreground">
            Hi {order.fullName.split(" ")[0]}! Please provide a few details so I can create the perfect CV for you.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: CV Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Upload Your CV</h2>
                  <p className="text-sm text-muted-foreground">
                    This is the CV I&apos;ll be rewriting for you
                  </p>
                </div>

                <div>
                  <Label className="text-foreground mb-2 block">Your Current CV *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      cvFileName ? "border-green-500 bg-green-50" : "border-border hover:border-primary"
                    }`}
                    onClick={() => document.getElementById("cv-upload")?.click()}
                  >
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleCvUpload}
                    />
                    {cvFileName ? (
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <FileText className="h-6 w-6" />
                        <span className="font-medium">{cvFileName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-foreground font-medium mb-1">
                          Click to upload your CV
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC, or DOCX (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  {errors.cvFile && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.cvFile.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="linkedinUrl" className="text-foreground">
                    LinkedIn Profile URL (optional)
                  </Label>
                  <Input
                    id="linkedinUrl"
                    {...register("linkedinUrl")}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps me understand your experience better
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Career Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Career Goals</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell me about the roles you&apos;re targeting
                  </p>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Which industries are you targeting? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {industryOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          watchedIndustries?.includes(option.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleIndustry(option.value)}
                      >
                        <Checkbox
                          checked={watchedIndustries?.includes(option.value)}
                          onCheckedChange={() => toggleIndustry(option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.industries && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.industries.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="jobTitles" className="text-foreground">
                    What roles are you targeting? *
                  </Label>
                  <Input
                    id="jobTitles"
                    {...register("jobTitles")}
                    placeholder="e.g., Product Manager, Senior PM, Head of Product"
                    className="mt-2"
                  />
                  {errors.jobTitles && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.jobTitles.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Where are you in your career? *
                  </Label>
                  <RadioGroup
                    value={watch("careerStage")}
                    onValueChange={(value) => setValue("careerStage", value as any)}
                  >
                    {careerStageOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.careerStage && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.careerStage.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    When do you want to start? *
                  </Label>
                  <RadioGroup
                    value={watch("timeline")}
                    onValueChange={(value) => setValue("timeline", value as any)}
                  >
                    {timelineOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`timeline-${option.value}`} />
                        <Label htmlFor={`timeline-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.timeline && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.timeline.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location" className="text-foreground">
                    Where are you based / looking for work? *
                  </Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g., London, UK or Remote"
                    className="mt-2"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Your Experience</h2>
                  <p className="text-sm text-muted-foreground">
                    Help me understand your background
                  </p>
                </div>

                <div>
                  <Label htmlFor="currentRole" className="text-foreground">
                    Describe your current or most recent role *
                  </Label>
                  <Textarea
                    id="currentRole"
                    {...register("currentRole")}
                    placeholder="What do/did you do day-to-day? What were your main responsibilities?"
                    className="mt-2"
                    rows={4}
                  />
                  {errors.currentRole && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.currentRole.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="achievements" className="text-foreground">
                    What are your top achievements? *
                  </Label>
                  <Textarea
                    id="achievements"
                    {...register("achievements")}
                    placeholder="Share specific results, numbers, or impact you've had. Even rough estimates help!"
                    className="mt-2"
                    rows={4}
                  />
                  {errors.achievements && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.achievements.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    What challenges are you facing? *
                  </Label>
                  <div className="space-y-2">
                    {challengeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          watchedChallenges?.includes(option.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleChallenge(option.value)}
                      >
                        <Checkbox
                          checked={watchedChallenges?.includes(option.value)}
                          onCheckedChange={() => toggleChallenge(option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.challenges && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.challenges.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalContext" className="text-foreground">
                    Anything else I should know? (optional)
                  </Label>
                  <Textarea
                    id="additionalContext"
                    {...register("additionalContext")}
                    placeholder="Career gaps, specific concerns, particular companies you're targeting..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Extras */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Final Details</h2>
                  <p className="text-sm text-muted-foreground">
                    A few more things to help me tailor your CV
                  </p>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Do you have a cover letter? *
                  </Label>
                  <RadioGroup
                    value={watch("hasCoverLetter")}
                    onValueChange={(value) => setValue("hasCoverLetter", value as any)}
                  >
                    {coverLetterOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`cover-${option.value}`} />
                        <Label htmlFor={`cover-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.hasCoverLetter && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.hasCoverLetter.message}
                    </p>
                  )}
                </div>

                {watchedHasCoverLetter === "yes" && (
                  <div>
                    <Label className="text-foreground mb-2 block">Upload Cover Letter</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        coverLetterFileName ? "border-green-500 bg-green-50" : "border-border hover:border-primary"
                      }`}
                      onClick={() => document.getElementById("cover-letter-upload")?.click()}
                    >
                      <input
                        id="cover-letter-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleCoverLetterUpload}
                      />
                      {coverLetterFileName ? (
                        <div className="flex items-center justify-center gap-2 text-green-700">
                          <FileText className="h-5 w-5" />
                          <span className="font-medium">{coverLetterFileName}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="certifications" className="text-foreground">
                    Any certifications or qualifications? (optional)
                  </Label>
                  <Input
                    id="certifications"
                    {...register("certifications")}
                    placeholder="e.g., PMP, AWS Certified, CPA"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tools" className="text-foreground">
                    Key tools or technologies you use? (optional)
                  </Label>
                  <Input
                    id="tools"
                    {...register("tools")}
                    placeholder="e.g., Figma, Python, Salesforce, Excel"
                    className="mt-2"
                  />
                </div>

                {/* Summary before submit */}
                <div className="bg-secondary rounded-lg p-4 mt-6">
                  <h3 className="font-semibold mb-2">Ready to submit!</h3>
                  <p className="text-sm text-muted-foreground">
                    Once you submit, I&apos;ll start working on your CV. You&apos;ll receive it within 48-96 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePrevious}>
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-coral hover:bg-coral-dark text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Start My Order"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Questions? Reply to your confirmation email or contact hello@applybetter.com
        </p>
      </main>
    </div>
  );
}
