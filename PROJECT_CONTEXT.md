# Rightfit - Project Context

## What This Is

Rightfit is a $30 CV rewrite service targeting job seekers who are qualified but getting ghosted. The founder is a recruiter with Fortune 500 experience who has been fixing CVs informally for years.

**Core Value Prop**: "I rewrite your CV so your impact is obvious in seconds."

## Current State

### Built (MVP + Admin Backoffice)
- [x] Next.js 14 project with App Router
- [x] Tailwind CSS with warm color theme (coral, cream, navy)
- [x] shadcn/ui component library
- [x] Project tracking system (CHANGELOG.md, PROJECT_CONTEXT.md)
- [x] CV Reviewer skill for AI grading
- [x] Landing page (14 sections with provided copy)
- [x] 8-step intake form with progress bar
- [x] CV parsing utilities (PDF + DOCX)
- [x] CV grading API (OpenAI GPT-4)
- [x] Lead capture API
- [x] Free audit modal with email gate
- [x] **Admin Backoffice** (password protected)
  - [x] Dashboard with stats and submissions table
  - [x] Submission detail view with 4 tabs
  - [x] CV Review panel (AI grades, notes, prompts)
  - [x] Leads management page
  - [x] Billing overview page
  - [x] Settings page
- [x] **Supabase Integration** (database + file storage)
  - [x] Full schema with 6 tables
  - [x] API routes with JSON fallback
  - [x] File upload to Supabase Storage

### Not Built (Future Phases)
- [ ] Payment processing (Stripe) - currently manual invoicing
- [ ] User accounts / customer dashboard
- [ ] Automated CV delivery
- [ ] Referral tracking system
- [ ] Email automation / sequences
- [ ] Analytics beyond Vercel basics

## Key Decisions Made

1. **$30 single price** - PMF validation, not tiered pricing yet
2. **Email + CV captured early** - Steps 1-2 of form for lead preservation
3. **Payment at end of form** - After completing full intake
4. **Friendly design** - Coral (#FF6B6B), cream (#FFFBF5), navy (#2D3748)
5. **Inter font** - Clean, readable, universally available
6. **OpenAI GPT-4** - For free CV audit grading
7. **Skill-based grading** - CV Reviewer skill can be refined independently
8. **Supabase** - PostgreSQL database + file storage (with JSON fallback)
9. **Simple admin auth** - Password-based, cookie session (upgradeable later)

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **CV Parsing**: pdf-parse (PDF) + mammoth (DOCX)
- **LLM**: OpenAI GPT-4 (lazy initialization)
- **Database**: Supabase (PostgreSQL) with JSON file fallback
- **File Storage**: Supabase Storage (cv-files bucket)
- **Deployment**: Ready for Vercel

### Key Files
```
rightfit/
├── CHANGELOG.md              # Change tracking
├── PROJECT_CONTEXT.md        # This file
├── .env.example              # Environment variables template
├── .env.local                # Local environment (gitignored)
├── middleware.ts             # Admin route protection
├── app/
│   ├── page.tsx              # Landing page (14 sections)
│   ├── form/page.tsx         # 8-step intake form
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Warm theme CSS
│   ├── admin/                # Admin backoffice
│   │   ├── layout.tsx        # Admin layout
│   │   ├── page.tsx          # Dashboard
│   │   ├── login/            # Login page
│   │   ├── submissions/      # Submissions list + detail
│   │   ├── leads/            # Leads management
│   │   ├── billing/          # Billing overview
│   │   └── settings/         # Settings page
│   └── api/
│       ├── grade-cv/         # CV grading endpoint
│       ├── submit-intake/    # Form submission endpoint
│       ├── capture-lead/     # Email capture endpoint
│       └── admin/            # Admin API routes
│           ├── login/        # Auth
│           ├── logout/       # Auth
│           ├── submissions/  # CRUD
│           ├── stats/        # Dashboard stats
│           ├── notes/        # Review notes
│           ├── payments/     # Payment tracking
│           └── leads/        # Lead management
├── components/
│   ├── sections/             # 14 landing page sections
│   ├── form/                 # 8 form step components
│   ├── admin/                # Admin components
│   │   ├── AdminNav.tsx      # Sidebar navigation
│   │   ├── AdminShell.tsx    # Page wrapper
│   │   ├── StatsCard.tsx     # Dashboard stats
│   │   └── SubmissionsTable.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── openai.ts             # OpenAI client (lazy init)
│   ├── cv-parser.ts          # PDF/DOCX parsing
│   ├── cv-reviewer-skill.ts  # Grading logic
│   ├── form-schema.ts        # Zod schemas
│   ├── supabase.ts           # Supabase client + helpers
│   ├── utils.ts              # Utility functions
│   └── db/
│       ├── schema.sql        # Supabase database schema
│       └── types.ts          # TypeScript types
└── data/                     # JSON fallback (created at runtime)
    ├── leads.json            # Captured emails
    └── submissions/          # Intake form submissions
```

### Database Schema (Supabase)

6 tables in `lib/db/schema.sql`:
- **submissions** - CV rewrite orders with full customer data
- **ai_grades** - ChatGPT CV analysis results
- **review_notes** - Admin notes/prompts for each submission
- **payments** - Payment tracking (Stripe-ready)
- **leads** - Free audit email captures
- **activity_log** - Audit trail of all actions

### CV Reviewer Skill (Separate)
**Location**: `~/.cursor/skills-cursor/cv-reviewer/SKILL.md`

This skill contains recruiter expertise and is referenced by the grading API. It can be refined independently without changing code.

**Contains**:
- 20+ year recruiter persona
- 5 evaluation criteria with weightings
- Grading rubric (0-100 scale)
- Niche-specific guidance
- Good/bad bullet examples

## User Flows

### Primary Flow (Paid CV Rewrite)
1. Landing page → "Revamp your CV" CTA
2. 8-step intake form
   - Step 1: Name + Email (lead capture)
   - Step 2: CV Upload + LinkedIn
   - Step 3-7: Career details
   - Step 8: Review + Pay $30
3. Submission saved to Supabase (or /data/submissions/)
4. Admin reviews in backoffice at /admin
5. Manual CV rewrite by founder
6. Delivery via email in 48-96 hours

### Secondary Flow (Free Audit Lead Magnet)
1. Landing page → "Free quick audit" CTA
2. CV Upload modal opens
3. AI grades CV using CV Reviewer skill
4. Show basic score (overall + 3 issues)
5. Email gate for full report
6. Lead captured to Supabase (or /data/leads.json)
7. Full report + upsell to $30 rewrite

### Admin Backoffice Flow
1. Visit /admin → redirected to /admin/login
2. Enter admin password (258741)
3. Dashboard shows stats + recent submissions
4. Click submission to view details
5. CV Review tab: see AI analysis, add notes/prompts
6. Update status as work progresses
7. Billing tab: track payment status

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Supabase (for full database features)
NEXT_PUBLIC_SUPABASE_URL=https://flffcpfnxalqkysfwqhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Access
ADMIN_PASSWORD=258741

# Stripe (future - not implemented yet)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Running the Project

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

**Admin Backoffice**: http://localhost:3000/admin (password: 258741)

## Supabase Setup (if not done)

1. Go to https://supabase.com/dashboard/project/flffcpfnxalqkysfwqhl
2. SQL Editor → paste contents of `lib/db/schema.sql` → Run
3. Storage → Create bucket "cv-files" (private)
4. Settings → API → copy service_role key to .env.local

## What's Next

After MVP validation:
1. Stripe payment integration (schema ready)
2. Referral tracking ($5 per referral)
3. LinkedIn profile optimization add-on
4. Cover letter add-on
5. Email automation sequences
6. Customer-facing order status page

## Important Notes for Future Agents

1. **Always update CHANGELOG.md** after making changes
2. **CV Reviewer skill is separate** - at ~/.cursor/skills-cursor/cv-reviewer/SKILL.md
3. **Copy tone is casual/honest** - avoid corporate speak
4. **Design is warm** - coral (#FF6B6B), cream (#FFFBF5), soft navy (#2D3748)
5. **Form captures email early** - steps 1-2 for lead preservation
6. **OpenAI uses lazy init** - won't fail at build time without API key
7. **Supabase is optional** - APIs fall back to JSON files if not configured
8. **Admin password** - currently 258741 (set via ADMIN_PASSWORD env var)
9. **Database schema** - run `lib/db/schema.sql` in Supabase SQL Editor
10. **Storage bucket** - create "cv-files" bucket in Supabase Storage
