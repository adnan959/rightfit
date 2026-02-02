# ApplyBetter Changelog

All notable changes to this project will be documented in this file.

## [2026-02-01] - Taxfix-Style Order Completion Form

### Changed

#### Order Completion Page (`/order/[id]/complete`)
- **Complete redesign** with Taxfix-style single-page vertical stepper
- **FormSection component** with three states: completed, active, upcoming
- **Vertical timeline** with connecting lines between sections
- **Collapsible sections** - Completed sections show summary + "Edit" button
- **Visual indicators** - Green checkmarks (completed), arrow (active), numbered circles (upcoming)
- **Progress bar** in sticky header showing completion percentage
- **Four sections**:
  1. Upload your CV - CV file upload + optional LinkedIn
  2. Career goals - Industries, job titles, career stage, timeline, location
  3. Your experience - Current role, achievements, challenges
  4. Final details - Cover letter, certifications, tools

### Technical Notes
- All sections visible on single page (no page navigation)
- Click "Edit" on any completed section to re-expand
- Auto-advances to next section on "Continue"
- Final "Start My Order" button in last section

---

## [2026-02-01] - Payment-First Form Flow (Taxfit/Taxscout Style)

### Added

#### Simplified Checkout Flow
- **2-step checkout** instead of 8 steps:
  - Step 1: Name + Email (lead captured immediately)
  - Step 2: Stripe payment ($30)
- **CheckoutPayment component** (`components/form/CheckoutPayment.tsx`) - Streamlined payment UI
- **Post-payment redirect** to `/order/[id]/complete` for details collection

#### New Database Status
- **`pending_details`** status added to `SubmissionStatus` enum
- Orders are created with `pending_details` after payment
- Status changes to `pending` once customer completes details form

#### Order Details API
- **`/api/order/[id]/details`** (PATCH) - Updates order with full customer details
- Handles CV/cover letter file uploads
- Validates token for security
- Changes status from `pending_details` to `pending`

#### Email Updates
- **Order confirmation email** now includes "Complete Your Order" CTA
- Links to completion page with magic token
- Different messaging for payment-first flow

#### Admin Orders View
- **"Awaiting Details" badge** (orange) shown for `pending_details` orders
- Job titles field hidden when empty (for incomplete orders)
- Clear visual distinction between complete and incomplete orders

### Changed
- **IntakeForm** simplified to 2 steps (was 8)
- **Step1BasicInfo** made generic (works with any form containing name/email)
- **submit-intake API** now accepts minimal data (name, email, paymentIntentId)
- Creates order with `pending_details` status and empty fields

### Database Schema Updates
- Added `pending_details` to `submission_status` enum
- Added `info_request`, `revision_request` to `note_type` enum
- Added more values to `lead_source` enum (`form_step1`, `free_audit`, `newsletter`, `other`)
- Added `metadata` JSONB column to `leads` table
- **Renamed** `current_role` to `current_job_role` (reserved keyword fix)
- Made career fields nullable for payment-first flow

### Technical Notes
- Lead captured at Step 1 before payment (to `leads` table)
- Order created at payment success (to `submissions` table)
- Magic link tokens use SHA256 hash with `ORDER_TOKEN_SECRET`
- JSON fallback uses `/tmp` on Vercel (read-only filesystem)

---

## [2026-02-01] - Customer Order Experience

### Added

#### Customer Order Status Page (`/order/[id]`)
- **Magic link authentication** - Access via token in URL (sent in email)
- **Order status display** with color-coded badges
- **Status descriptions** for each stage (pending, in_progress, review, completed, delivered)
- **CV download section** when order is completed/delivered
- **Revision request form** for customers to request changes
- **Info requests display** - Shows any questions from admin

#### Order Lookup Page (`/order/lookup`)
- Customers can find orders by entering Order ID + Email
- Generates magic link token and redirects to order page

#### API Endpoints
- **`/api/order/[id]`** (GET) - Fetch order details with token verification
- **`/api/order/[id]/revision`** (POST) - Submit revision request
- **`/api/order/generate-token`** (POST) - Generate magic link token

#### Magic Link System (`lib/order-tokens.ts`)
- `generateOrderToken()` - SHA256 hash of orderId + email + secret
- `verifyOrderToken()` - Validates customer access
- `generateOrderUrl()` - Full URL with token for emails

#### Email Templates (`lib/email-templates.ts`)
- **Order confirmation email** with magic link to order page
- **CV delivery email** with download link and revision CTA

### Technical Notes
- Tokens use lowercase email for consistency
- `ORDER_TOKEN_SECRET` env var required for token generation
- Falls back to `onboarding@resend.dev` if custom domain not verified

---

## [2026-02-01] - Stripe & Resend Integration

### Added

#### Stripe Payment Processing
- **Stripe client** (`lib/stripe.ts`) with lazy initialization
- **PaymentIntent creation** (`/api/create-payment-intent`)
- **Step8Review component** updated with Stripe Elements
- Payment verification in submit-intake API
- `payments` table records for successful payments

#### Resend Email Service
- **Resend client** (`lib/resend.ts`) with lazy initialization
- Order confirmation emails on submission
- CV delivery emails when order marked delivered
- Fallback to `onboarding@resend.dev` for testing

### Configuration
- `STRIPE_SECRET_KEY` - Server-side Stripe key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe key
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` (optional) - Custom from address
- `ORDER_TOKEN_SECRET` - For magic link generation

---

## [2026-02-01] - Admin UI Polish

### Changed

#### Header & Navigation
- **Sign Out button moved** from sidebar footer to top-right header (next to page actions)
- **Header alignment** - Page titles now horizontally align with the sidebar logo line
- **Title size reduced** from `text-xl/2xl` to `text-lg` for cleaner proportions
- **Fixed header height** to match sidebar logo height (`h-14`)

#### Orders Index (`/admin/orders`)
- **Tighter row spacing** - Reduced padding (`px-3 py-2.5`) and gap between rows (`space-y-2`)
- **Shadow styling** - Added `shadow-sm` with `hover:shadow-md` for depth
- **Inlined timestamp** - "3h ago" now appears on the same line as role and email
- **Ellipsis menu** replaces arrow - Contains "View Details", "Send Message", "Mark Delivered"
- **Smaller avatars** - Reduced from 48px to 40px

#### Order Detail (`/admin/orders/[id]`)
- **Header extends to edges** with negative margins for full-width feel
- **Dividing line** between back button and order title
- **Smaller action buttons** with `size="sm"`

### Technical Notes
- AdminShell now handles logout globally (removed from AdminNav)
- OrdersTable passes `onStatusChange` to individual cards for inline actions

---

## [2026-02-01] - Orders Workflow Redesign

### Added

#### Orders Page (`/admin/orders`)
- Renamed "Submissions" to "Orders" throughout the admin interface
- New chronological, single-page order detail view (Shopify-style workflow)
- **CustomerCard component**: Displays customer name, email, LinkedIn, payment status, order date
- **SubmissionCard component**: Shows target role, industries, achievements, challenges, tools, certifications
- **FilesSection component**: 
  - Original CV view/download
  - Cover letter view/download (if exists)
  - Rewritten CV versioning (V1, V2, V3...)
  - Drag-and-drop upload with file validation (PDF/DOCX, max 10MB)
- **OrderTimeline component**: Chronological activity feed showing all order events
- **OrderActions component**: 
  - Send Message modal with templates (Status Update, CV Ready, Custom)
  - Request Info modal with templates (Clarification, Missing Info, Achievements)
  - Refund modal with reason tracking
- Action buttons: Change Status, Send Message, Request Info, Mark Complete, Refund

#### Dummy Data (`lib/dummy-data.ts`)
- 6 realistic orders at different workflow stages for testing:
  - Order 1: Sarah Chen (Tech PM) - Pending, just received
  - Order 2: Marcus Johnson (Marketing) - In Progress with V1 draft
  - Order 3: Emily Rodriguez (Finance) - Under Review
  - Order 4: James Wilson (Sales) - Completed, ready for delivery
  - Order 5: Priya Patel (Data Analytics) - Delivered with V1 + V2
  - Order 6: Alex Thompson - Refunded
- Each order includes realistic form data, AI grades, notes, payments, and activity logs
- CVVersion type for tracking multiple rewritten CV versions

#### New API Routes
- `/api/admin/orders` - List and update orders (with dummy data fallback)
- `/api/admin/orders/[id]` - Get single order detail

### Changed
- Admin navigation: "Submissions" → "Orders"
- Order detail page: Replaced 4-tab layout with single-page chronological flow
- OrdersTable component replaces SubmissionsTable for orders page

### Technical Notes
- Orders page falls back to dummy data when database is not configured
- CV versioning supports unlimited versions with auto-incrementing numbers
- Email modals are UI-only (no backend integration yet)
- File uploads are simulated in UI (no actual storage in this phase)

---

## [2026-01-31] - Build Fixes for Vercel Deployment

### Fixed
- **TypeScript error in LeadSource type** - Added missing source values (`free_audit`, `newsletter`, `other`) to `LeadSource` type in `lib/db/types.ts`
- **Suspense boundary for useSearchParams** - Wrapped `useSearchParams()` in Suspense boundary in `/admin/login` page to fix Next.js 16 static generation error

### Changed
- Simplified `LeadDisplay` interface in `app/admin/leads/page.tsx` to use updated `LeadSource` type

---

## [2026-01-31] - Admin Backoffice & Supabase Integration

### Added

#### Admin Backoffice (`/admin`)
- Password-protected admin area (middleware.ts)
- Login page with session cookie management
- **Dashboard** (`/admin`): Stats cards + submissions table with filters
- **Submissions List** (`/admin/submissions`): Full list with search, status filter, pagination
- **Submission Detail** (`/admin/submissions/[id]`): 4-tab interface
  - Overview: Customer info, career goals, files
  - CV Review: AI analysis display, notes/prompts editor
  - Billing: Payment status (Stripe-ready)
  - Activity: Timeline of all actions
- **Leads Page** (`/admin/leads`): Lead management with conversion tracking
- **Billing Page** (`/admin/billing`): Revenue overview, payment history
- **Settings Page** (`/admin/settings`): Integration status, env var reference

#### Supabase Integration
- Database schema (`lib/db/schema.sql`) with 6 tables:
  - `submissions` - CV rewrite orders
  - `ai_grades` - ChatGPT analysis results
  - `review_notes` - Admin notes/prompts
  - `payments` - Payment tracking (Stripe-ready)
  - `leads` - Free audit email captures
  - `activity_log` - Audit trail
- TypeScript types (`lib/db/types.ts`) matching schema
- Supabase client (`lib/supabase.ts`) with file storage helpers
- File upload to Supabase Storage (cv-files bucket)

#### API Routes (Admin)
- `/api/admin/login` - Session creation
- `/api/admin/logout` - Session destruction
- `/api/admin/submissions` - List + update submissions
- `/api/admin/submissions/[id]` - Single submission with relations
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/notes` - CRUD for review notes
- `/api/admin/payments` - Payment tracking
- `/api/admin/leads` - Lead management

#### Updated API Routes
- `/api/submit-intake` - Now stores to Supabase with file upload
- `/api/grade-cv` - Stores AI grades in database
- `/api/capture-lead` - Stores leads with conversion tracking
- All routes have JSON file fallback when Supabase not configured

#### Admin Components
- `AdminNav` - Sidebar navigation
- `AdminShell` - Page wrapper with header
- `StatsCard` - Dashboard stat display
- `SubmissionsTable` - Paginated table with status dropdown

#### Utilities
- `formatDistanceToNow()` - Relative time formatting
- `formatCurrency()` - Currency display
- `formatDate()` / `formatDateTime()` - Date formatting

### Configuration
- `.env.example` updated with Supabase + admin vars
- `.env.local` created with project credentials
- Supabase project: https://supabase.com/dashboard/project/flffcpfnxalqkysfwqhl

### Technical Notes
- Admin password: 258741 (via ADMIN_PASSWORD env var)
- APIs gracefully fall back to JSON files if Supabase not configured
- Middleware protects all `/admin/*` routes except `/admin/login`
- 7-day session cookie for admin auth

---

## [2026-01-28] - Initial MVP Release

### Added

#### Project Infrastructure
- Initialized Next.js 14 project with App Router and TypeScript
- Configured Tailwind CSS v4 with custom warm color palette (coral, cream, navy)
- Installed and configured shadcn/ui component library
- Set up project tracking system (CHANGELOG.md, PROJECT_CONTEXT.md)
- Created .env.example for environment variables

#### Landing Page (14 Sections)
- **Hero**: Pain-first headline with $30 price anchor and "Revamp your CV" CTA
- **Recruiter Mindset**: Explains the 10-second scan and 5 key questions
- **Quick Intro**: Personal origin story ("in exchange for food")
- **Why CVs Fail**: List of common fixable problems
- **What You're Really Buying**: Sets expectations about outside perspective
- **Self-Check**: Interactive 8-item checklist (shows warning if 3+ checked)
- **How It Works**: 3-step process with icons
- **Deliverables**: "What You Get" and "What I Won't Do" side-by-side
- **Proof**: Placeholder for testimonials and before/after examples
- **The Offer**: $30 price with honest framing
- **Referral**: $5 per referral program details
- **Who This Is For**: For/Not For qualification lists
- **FAQ**: 8-question accordion with trust-first answers
- **Final CTA**: Dual CTA (paid rewrite + free audit)

#### 8-Step Intake Form
- Step 1: Name + Email (lead capture)
- Step 2: CV Upload + LinkedIn (commitment point)
- Step 3: Industry + Job Titles + Career Stage
- Step 4: Timeline + Location
- Step 5: Current Role + Achievements
- Step 6: Challenges + Additional Context
- Step 7: Cover Letter + Certifications + Tools
- Step 8: Review Summary + Payment CTA
- Progress bar throughout
- Form validation with Zod schemas
- File upload with drag-and-drop

#### CV Grading System
- Created CV Reviewer Skill file at ~/.cursor/skills-cursor/cv-reviewer/SKILL.md
- 5 evaluation criteria: Clarity, Impact Evidence, Scannability, ATS Safety, First Impression
- Grading rubric (0-100 scale with labels)
- Basic vs Full report modes
- PDF and DOCX parsing support

#### API Routes
- `/api/grade-cv`: CV grading with OpenAI GPT-4
- `/api/submit-intake`: Intake form submission (saves to JSON files)
- `/api/capture-lead`: Email capture for free audit

#### Free Audit Feature
- CV Upload Modal with drag-and-drop
- Basic grade shown immediately (score + 3 issues)
- Email gate for full report
- Full report with detailed analysis and recommendations
- Upsell CTA to $30 rewrite

### Technical Decisions

1. **Next.js 14 App Router** - Modern, SEO-friendly, easy Vercel deployment
2. **Tailwind CSS v4** - Latest version with improved performance
3. **shadcn/ui** - Accessible, customizable components
4. **React Hook Form + Zod** - Type-safe form handling
5. **OpenAI GPT-4** - For CV grading (lazy initialization to avoid build errors)
6. **JSON file storage** - MVP approach for leads/submissions (upgrade to DB later)
7. **Inter font** - Clean, readable, widely available

### Design

- **Primary Color**: Coral (#FF6B6B)
- **Background**: Cream (#FFFBF5)
- **Text**: Navy (#2D3748)
- **Accent**: Success green (#48BB78)
- **Style**: Friendly, approachable, casual tone matching the copy

### What's NOT Included (Future)

- Payment processing (Stripe)
- User accounts / dashboard
- Automated CV delivery
- Referral tracking system
- Email automation sequences
- Analytics beyond Vercel basics

### File Structure

```
applybetter/
├── CHANGELOG.md
├── PROJECT_CONTEXT.md
├── .env.example
├── app/
│   ├── page.tsx                 # Landing page
│   ├── form/page.tsx            # Intake form
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Warm theme styles
│   └── api/
│       ├── grade-cv/route.ts
│       ├── submit-intake/route.ts
│       └── capture-lead/route.ts
├── components/
│   ├── sections/                # 14 landing page sections
│   ├── form/                    # 8 form step components
│   └── ui/                      # UI components + shadcn
├── lib/
│   ├── openai.ts
│   ├── cv-parser.ts
│   ├── cv-reviewer-skill.ts
│   └── form-schema.ts
└── data/                        # Created at runtime for submissions
```

### CV Reviewer Skill (Separate)

Located at: `~/.cursor/skills-cursor/cv-reviewer/SKILL.md`

Contains:
- 20+ year recruiter persona
- 5 evaluation criteria with weightings
- Grading rubric
- Niche-specific guidance (Tech, Marketing, Sales, Finance, etc.)
- Good/bad example patterns
- Output formats for basic and full reports

---

## How to Run

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run development server
npm run dev

# Build for production
npm run build
```
