# Rightfit Changelog

All notable changes to this project will be documented in this file.

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
rightfit/
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
