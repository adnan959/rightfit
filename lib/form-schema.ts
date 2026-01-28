import { z } from "zod";

// Step 1: Basic Info
export const step1Schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
});

// Step 2: CV Upload
export const step2Schema = z.object({
  cvFile: z.any().optional(), // File validation handled separately
  linkedinUrl: z.string().optional(),
});

// Step 3: Career Goals
export const step3Schema = z.object({
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  jobTitles: z.string().min(1, "Please enter target job titles"),
  careerStage: z.enum([
    "student",
    "recent_graduate",
    "career_switcher",
    "currently_working",
  ]),
});

// Step 4: Timeline & Location
export const step4Schema = z.object({
  timeline: z.enum([
    "immediately",
    "1_2_months",
    "3_4_months",
    "exploring",
  ]),
  location: z.string().min(1, "Please enter your location"),
});

// Step 5: Experience
export const step5Schema = z.object({
  currentRole: z.string().min(10, "Please provide more detail about your role"),
  achievements: z.string().min(10, "Please share your achievements"),
});

// Step 6: Challenges
export const step6Schema = z.object({
  challenges: z.array(z.string()).min(1, "Please select at least one challenge"),
  additionalContext: z.string().optional(),
});

// Step 7: Extra Materials
export const step7Schema = z.object({
  hasCoverLetter: z.enum(["yes", "no", "want_help"]),
  coverLetterFile: z.any().optional(),
  certifications: z.string().optional(),
  tools: z.string().optional(),
});

// Step 8: Review (no additional validation needed)
export const step8Schema = z.object({});

// Complete form schema
export const intakeFormSchema = z.object({
  // Step 1
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  // Step 2
  cvFile: z.any().optional(),
  linkedinUrl: z.string().optional(),
  // Step 3
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  jobTitles: z.string().min(1, "Please enter target job titles"),
  careerStage: z.enum([
    "student",
    "recent_graduate",
    "career_switcher",
    "currently_working",
  ]),
  // Step 4
  timeline: z.enum([
    "immediately",
    "1_2_months",
    "3_4_months",
    "exploring",
  ]),
  location: z.string().min(1, "Please enter your location"),
  // Step 5
  currentRole: z.string().min(10, "Please provide more detail about your role"),
  achievements: z.string().min(10, "Please share your achievements"),
  // Step 6
  challenges: z.array(z.string()).min(1, "Please select at least one challenge"),
  additionalContext: z.string().optional(),
  // Step 7
  hasCoverLetter: z.enum(["yes", "no", "want_help"]),
  coverLetterFile: z.any().optional(),
  certifications: z.string().optional(),
  tools: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

// Industry options
export const industryOptions = [
  { value: "tech", label: "Tech" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "data_analytics", label: "Data and Analytics" },
  { value: "design_creative", label: "Design and Creative" },
  { value: "operations_pm", label: "Operations and Project Management" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

// Career stage options
export const careerStageOptions = [
  { value: "student", label: "Student" },
  { value: "recent_graduate", label: "Recent graduate" },
  { value: "career_switcher", label: "Career switcher" },
  { value: "currently_working", label: "Currently working and looking to move" },
];

// Timeline options
export const timelineOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "1_2_months", label: "Within 1 to 2 months" },
  { value: "3_4_months", label: "Within 3 to 4 months" },
  { value: "exploring", label: "Just exploring for now" },
];

// Challenge options
export const challengeOptions = [
  { value: "writing_cv", label: "Writing strong CV points" },
  { value: "recruiter_wants", label: "Knowing what recruiters want" },
  { value: "getting_calls", label: "Getting interview calls" },
  { value: "interview_confidence", label: "Interview confidence" },
  { value: "explaining_experience", label: "Explaining my experience clearly" },
  { value: "all_above", label: "All of the above honestly" },
];

// Cover letter options
export const coverLetterOptions = [
  { value: "yes", label: "Yes and I will upload it" },
  { value: "no", label: "No" },
  { value: "want_help", label: "I want help creating one" },
];
