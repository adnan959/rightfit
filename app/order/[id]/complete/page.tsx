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
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle,
  ArrowRight,
  FileText,
  Check,
  ChevronRight,
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

type SectionStatus = "completed" | "active" | "upcoming";

interface FormSectionProps {
  title: string;
  status: SectionStatus;
  summary?: string;
  onEdit?: () => void;
  children: React.ReactNode;
  sectionNumber: number;
  isLast?: boolean;
}

function FormSection({ 
  title, 
  status, 
  summary, 
  onEdit, 
  children, 
  sectionNumber,
  isLast = false 
}: FormSectionProps) {
  return (
    <div className="relative">
      {/* Timeline connector line */}
      {!isLast && (
        <div 
          className={`absolute left-[15px] top-[40px] w-[2px] h-[calc(100%-24px)] ${
            status === "completed" ? "bg-green-500" : "bg-border"
          }`}
        />
      )}
      
      <div className="flex gap-4">
        {/* Timeline indicator */}
        <div className="flex-shrink-0 relative z-10">
          {status === "completed" ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : status === "active" ? (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground">{sectionNumber}</span>
            </div>
          )}
        </div>
        
        {/* Section content */}
        <div className="flex-1 pb-8">
          {status === "completed" ? (
            // Collapsed completed state
            <div className="flex items-start justify-between py-2">
              <div>
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  {title}
                </h3>
                {summary && (
                  <p className="text-sm text-muted-foreground mt-1">{summary}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-primary hover:text-primary/80 -mt-1"
              >
                Edit
              </Button>
            </div>
          ) : status === "active" ? (
            // Expanded active state
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
              <div className="mt-4">
                {children}
              </div>
            </div>
          ) : (
            // Upcoming state
            <div className="py-2">
              <h3 className="font-medium text-muted-foreground">{title}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  
  // Track active section (1-4) and completed sections
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

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
  const watchedData = watch();

  // Fetch order to verify access
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const url = new URL(`/api/order/${id}`, window.location.origin);
        if (token) url.searchParams.set("token", token);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.success) {
          if (data.order.status !== "pending_details") {
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

  // Handlers
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
    const current = watchedData.industries || [];
    if (current.includes(value)) {
      setValue("industries", current.filter((i) => i !== value));
    } else {
      setValue("industries", [...current, value]);
    }
  };

  const toggleChallenge = (value: string) => {
    const current = watchedData.challenges || [];
    if (current.includes(value)) {
      setValue("challenges", current.filter((c) => c !== value));
    } else {
      setValue("challenges", [...current, value]);
    }
  };

  // Section validation
  const validateSection = async (section: number): Promise<boolean> => {
    switch (section) {
      case 1:
        return await trigger(["cvFile"]);
      case 2:
        return await trigger(["industries", "jobTitles", "careerStage", "timeline", "location"]);
      case 3:
        return await trigger(["currentRole", "achievements", "challenges"]);
      case 4:
        return await trigger(["hasCoverLetter"]);
      default:
        return true;
    }
  };

  const handleContinue = async () => {
    const isValid = await validateSection(activeSection);
    if (isValid) {
      setCompletedSections((prev) => new Set([...prev, activeSection]));
      if (activeSection < 4) {
        setActiveSection(activeSection + 1);
      }
    }
  };

  const handleEditSection = (section: number) => {
    setActiveSection(section);
  };

  const getSectionStatus = (section: number): SectionStatus => {
    if (completedSections.has(section) && activeSection !== section) {
      return "completed";
    }
    if (activeSection === section) {
      return "active";
    }
    return "upcoming";
  };

  // Generate summaries for completed sections
  const getSectionSummary = (section: number): string => {
    switch (section) {
      case 1:
        return cvFileName ? `${cvFileName} uploaded` : "";
      case 2:
        const industry = industryOptions.find(o => watchedData.industries?.includes(o.value))?.label || "";
        return `${watchedData.jobTitles || ""}${industry ? ` in ${industry}` : ""}${watchedData.location ? `, ${watchedData.location}` : ""}`;
      case 3:
        const achievementCount = watchedData.achievements?.split(/[.!?\n]/).filter(s => s.trim()).length || 0;
        return `${watchedData.currentRole?.slice(0, 50) || ""}${achievementCount > 0 ? `... ${achievementCount} achievement${achievementCount > 1 ? "s" : ""} listed` : ""}`;
      case 4:
        const coverStatus = coverLetterOptions.find(o => o.value === watchedData.hasCoverLetter)?.label || "";
        return coverStatus;
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();

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

  // Loading state
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

  // Error state
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

  // Success state
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

  // Calculate progress
  const progress = (completedSections.size / 4) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">ApplyBetter</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete Your Order
          </h1>
          <p className="text-muted-foreground">
            Hi {order.fullName.split(" ")[0]}! Please provide a few details so we can create the perfect CV for you.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-0">
          {/* Section 1: Upload CV */}
          <FormSection
            title="Upload your CV"
            status={getSectionStatus(1)}
            summary={getSectionSummary(1)}
            onEdit={() => handleEditSection(1)}
            sectionNumber={1}
          >
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                This is the CV I&apos;ll be rewriting for you
              </p>

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
                  Helps me understand your experience better
                </p>
              </div>

              <Button onClick={handleContinue} className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FormSection>

          {/* Section 2: Career Goals */}
          <FormSection
            title="Career goals"
            status={getSectionStatus(2)}
            summary={getSectionSummary(2)}
            onEdit={() => handleEditSection(2)}
            sectionNumber={2}
          >
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Tell me about the roles you&apos;re targeting
              </p>

              <div>
                <Label className="text-foreground mb-3 block">
                  Which industries are you targeting? *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {industryOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        watchedData.industries?.includes(option.value)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleIndustry(option.value)}
                    >
                      <Checkbox
                        checked={watchedData.industries?.includes(option.value)}
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
                  value={watchedData.careerStage}
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
                  value={watchedData.timeline}
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

              <Button onClick={handleContinue} className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FormSection>

          {/* Section 3: Your Experience */}
          <FormSection
            title="Your experience"
            status={getSectionStatus(3)}
            summary={getSectionSummary(3)}
            onEdit={() => handleEditSection(3)}
            sectionNumber={3}
          >
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Help me understand your background
              </p>

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
                        watchedData.challenges?.includes(option.value)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleChallenge(option.value)}
                    >
                      <Checkbox
                        checked={watchedData.challenges?.includes(option.value)}
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

              <Button onClick={handleContinue} className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FormSection>

          {/* Section 4: Final Details */}
          <FormSection
            title="Final details"
            status={getSectionStatus(4)}
            summary={getSectionSummary(4)}
            onEdit={() => handleEditSection(4)}
            sectionNumber={4}
            isLast
          >
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                A few more things to help me tailor your CV
              </p>

              <div>
                <Label className="text-foreground mb-3 block">
                  Do you have a cover letter? *
                </Label>
                <RadioGroup
                  value={watchedData.hasCoverLetter}
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

              {watchedData.hasCoverLetter === "yes" && (
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

              {/* Submit section */}
              <div className="bg-secondary/50 rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-2">Ready to submit!</h4>
                <p className="text-sm text-muted-foreground">
                  Once you submit, I&apos;ll start working on your CV. You&apos;ll receive it within 48-96 hours.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-coral hover:bg-coral-dark text-white py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Start My Order"
                )}
              </Button>
            </div>
          </FormSection>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Questions? Reply to your confirmation email or contact hello@applybetter.com
        </p>
      </main>
    </div>
  );
}
