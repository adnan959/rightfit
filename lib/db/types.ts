// Database types for ApplyBetter
// These match the Supabase schema defined in schema.sql

export type SubmissionStatus = 
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'delivered'
  | 'refunded';

export type CareerStage = 
  | 'student'
  | 'recent_graduate'
  | 'career_switcher'
  | 'currently_working';

export type TimelineOption = 
  | 'immediately'
  | '1_2_months'
  | '3_4_months'
  | 'exploring';

export type CoverLetterOption = 
  | 'yes'
  | 'no'
  | 'want_help';

export type NoteType = 
  | 'general'
  | 'ai_feedback'
  | 'prompt'
  | 'rewrite_instruction';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed';

export type LeadSource = 
  | 'audit_modal'
  | 'form_abandon'
  | 'direct'
  | 'free_audit'
  | 'newsletter'
  | 'other';

export type PriorityLevel = 
  | 'normal'
  | 'high'
  | 'urgent';

// Submission - Customer CV rewrite orders
export interface Submission {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Status
  status: SubmissionStatus;
  priority: PriorityLevel;
  
  // Customer info
  full_name: string;
  email: string;
  linkedin_url: string | null;
  
  // Career data
  industries: string[];
  job_titles: string;
  career_stage: CareerStage;
  timeline: TimelineOption;
  location: string;
  
  // Details
  current_role: string | null;
  achievements: string | null;
  challenges: string[];
  additional_context: string | null;
  
  // Extras
  has_cover_letter: CoverLetterOption;
  certifications: string | null;
  tools: string | null;
  
  // File paths
  cv_file_path: string | null;
  cover_letter_file_path: string | null;
  rewritten_cv_path: string | null;
  
  // Workflow
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  delivered_at: string | null;
}

// AI Grade breakdown scores
export interface AIGradeBreakdown {
  clarity: number;
  impact_evidence: number;
  scannability: number;
  ats_safety: number;
  first_impression: number;
}

// AI Grade detailed analysis
export interface AIGradeDetailedAnalysis {
  clarity?: string;
  impactEvidence?: string;
  scannability?: string;
  atsSafety?: string;
  firstImpression?: string;
}

// AI Grade - ChatGPT CV analysis results
export interface AIGrade {
  id: string;
  submission_id: string | null;
  created_at: string;
  
  overall_score: number;
  label: string;
  breakdown: AIGradeBreakdown;
  top_issues: string[];
  detailed_analysis: AIGradeDetailedAnalysis | null;
  recommendations: string[];
  raw_response: Record<string, unknown> | null;
  
  admin_verified: boolean;
  admin_notes: string | null;
}

// Review Note - Admin notes and prompts
export interface ReviewNote {
  id: string;
  submission_id: string;
  created_at: string;
  updated_at: string;
  
  note_type: NoteType;
  content: string;
  is_pinned: boolean;
}

// Payment - Billing and payment tracking
export interface Payment {
  id: string;
  submission_id: string | null;
  created_at: string;
  updated_at: string;
  
  amount: number; // In cents
  currency: string;
  status: PaymentStatus;
  
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  
  refund_amount: number | null;
  refund_reason: string | null;
  refunded_at: string | null;
  
  metadata: Record<string, unknown>;
}

// Lead - Free audit email captures
export interface Lead {
  id: string;
  created_at: string;
  
  email: string;
  source: LeadSource;
  cv_file_path: string | null;
  
  converted: boolean;
  converted_submission_id: string | null;
  converted_at: string | null;
}

// Activity Log - Audit trail
export interface ActivityLog {
  id: string;
  created_at: string;
  submission_id: string | null;
  
  action: string;
  description: string | null;
  metadata: Record<string, unknown>;
  actor: string;
}

// Insert types (for creating new records)
export type SubmissionInsert = Omit<Submission, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AIGradeInsert = Omit<AIGrade, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ReviewNoteInsert = Omit<ReviewNote, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type LeadInsert = Omit<Lead, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Update types (for updating existing records)
export type SubmissionUpdate = Partial<Omit<Submission, 'id' | 'created_at'>>;
export type AIGradeUpdate = Partial<Omit<AIGrade, 'id' | 'created_at'>>;
export type ReviewNoteUpdate = Partial<Omit<ReviewNote, 'id' | 'created_at'>>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at'>>;
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at'>>;

// Submission with related data (for detail views)
export interface SubmissionWithRelations extends Submission {
  ai_grades?: AIGrade[];
  review_notes?: ReviewNote[];
  payments?: Payment[];
  activity_log?: ActivityLog[];
}

// Dashboard stats
export interface DashboardStats {
  total_submissions: number;
  pending_count: number;
  in_progress_count: number;
  completed_today: number;
  total_revenue: number;
  pending_revenue: number;
}

// Status labels for display
export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  review: 'Under Review',
  completed: 'Completed',
  delivered: 'Delivered',
  refunded: 'Refunded',
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  refunded: 'bg-red-100 text-red-800',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  normal: 'bg-gray-100 text-gray-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export const CAREER_STAGE_LABELS: Record<CareerStage, string> = {
  student: 'Student',
  recent_graduate: 'Recent Graduate',
  career_switcher: 'Career Switcher',
  currently_working: 'Currently Working',
};

export const TIMELINE_LABELS: Record<TimelineOption, string> = {
  immediately: 'Immediately',
  '1_2_months': 'Within 1-2 months',
  '3_4_months': 'Within 3-4 months',
  exploring: 'Just exploring',
};
