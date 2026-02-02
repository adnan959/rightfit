-- ApplyBetter Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE submission_status AS ENUM (
  'pending_details',  -- Paid but waiting for customer to provide CV and details
  'pending',          -- All details provided, ready for processing
  'in_progress', 
  'review',
  'completed',
  'delivered',
  'refunded'
);

CREATE TYPE career_stage AS ENUM (
  'student',
  'recent_graduate',
  'career_switcher',
  'currently_working'
);

CREATE TYPE timeline_option AS ENUM (
  'immediately',
  '1_2_months',
  '3_4_months',
  'exploring'
);

CREATE TYPE cover_letter_option AS ENUM (
  'yes',
  'no',
  'want_help'
);

CREATE TYPE note_type AS ENUM (
  'general',
  'ai_feedback',
  'prompt',
  'rewrite_instruction'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

CREATE TYPE lead_source AS ENUM (
  'audit_modal',
  'form_abandon',
  'direct'
);

CREATE TYPE priority_level AS ENUM (
  'normal',
  'high',
  'urgent'
);

-- Submissions table - Customer CV rewrite orders
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Status tracking
  status submission_status DEFAULT 'pending' NOT NULL,
  priority priority_level DEFAULT 'normal' NOT NULL,
  
  -- Customer info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  
  -- Career data
  industries TEXT[] DEFAULT '{}',
  job_titles TEXT NOT NULL,
  career_stage career_stage NOT NULL,
  timeline timeline_option NOT NULL,
  location TEXT NOT NULL,
  
  -- Details
  current_job_role TEXT,
  achievements TEXT,
  challenges TEXT[] DEFAULT '{}',
  additional_context TEXT,
  
  -- Extras
  has_cover_letter cover_letter_option DEFAULT 'no',
  certifications TEXT,
  tools TEXT,
  
  -- File paths (Supabase Storage)
  cv_file_path TEXT,
  cover_letter_file_path TEXT,
  rewritten_cv_path TEXT,
  
  -- Workflow
  assigned_to TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- AI Grades table - ChatGPT CV analysis results
CREATE TABLE ai_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Scores
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  label TEXT NOT NULL,
  
  -- Breakdown scores (stored as JSONB for flexibility)
  breakdown JSONB NOT NULL DEFAULT '{
    "clarity": 0,
    "impact_evidence": 0,
    "scannability": 0,
    "ats_safety": 0,
    "first_impression": 0
  }',
  
  -- Issues and recommendations
  top_issues TEXT[] DEFAULT '{}',
  detailed_analysis JSONB,
  recommendations TEXT[] DEFAULT '{}',
  
  -- Full response for debugging
  raw_response JSONB,
  
  -- Admin review
  admin_verified BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

-- Review Notes table - Your notes and prompts for each submission
CREATE TABLE review_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  note_type note_type DEFAULT 'general' NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE
);

-- Payments table - Billing and payment tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Payment details
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd' NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  
  -- Stripe references
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_customer_id TEXT,
  
  -- Refund tracking
  refund_amount INTEGER,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Leads table - Free audit email captures
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  email TEXT NOT NULL,
  source lead_source DEFAULT 'audit_modal' NOT NULL,
  
  -- CV file if uploaded during free audit
  cv_file_path TEXT,
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  converted_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ
);

-- Activity Log table - Track all actions for audit trail
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Reference to related entity
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Activity details
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Actor
  actor TEXT DEFAULT 'system' -- 'system', 'admin', or email
);

-- Indexes for common queries
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_email ON submissions(email);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_priority ON submissions(priority);

CREATE INDEX idx_ai_grades_submission_id ON ai_grades(submission_id);
CREATE INDEX idx_review_notes_submission_id ON review_notes(submission_id);
CREATE INDEX idx_payments_submission_id ON payments(submission_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_converted ON leads(converted);

CREATE INDEX idx_activity_log_submission_id ON activity_log(submission_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_notes_updated_at
  BEFORE UPDATE ON review_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- For now, we'll use service role key which bypasses RLS
-- Enable RLS on all tables for future security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
-- These allow the backend to access all data
CREATE POLICY "Service role full access to submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ai_grades" ON ai_grades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to review_notes" ON review_notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to leads" ON leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to activity_log" ON activity_log
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket setup (run in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cv-files', 'cv-files', false);
