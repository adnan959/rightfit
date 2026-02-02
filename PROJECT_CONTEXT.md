# ApplyBetter - Project Context

## What This Is

ApplyBetter is a $30 CV rewrite service targeting job seekers who are qualified but getting ghosted. The founder is a recruiter with Fortune 500 experience who has been fixing CVs informally for years.

**Core Value Prop**: "I rewrite your CV so your impact is obvious in seconds."

## Current State

### Built (MVP + Admin Backoffice + Payments)
- [x] Next.js 14 project with App Router
- [x] Tailwind CSS with warm color theme (coral, cream, navy)
- [x] shadcn/ui component library
- [x] Project tracking system (CHANGELOG.md, PROJECT_CONTEXT.md)
- [x] CV Reviewer skill for AI grading
- [x] Landing page (14 sections with provided copy)
- [x] **Payment-First Checkout Flow** (Taxfit/Taxscout style)
  - [x] 2-step checkout: Name/Email → Stripe Payment
  - [x] Post-payment details collection page
  - [x] Taxfix-style vertical stepper with collapsible sections
- [x] CV parsing utilities (PDF + DOCX)
- [x] CV grading API (OpenAI GPT-4)
- [x] Lead capture API (captures at Step 1 before payment)
- [x] Free audit modal with email gate
- [x] **Stripe Integration** (payment processing)
- [x] **Resend Integration** (transactional emails)
- [x] **Customer Order Status Page** (`/order/[id]`)
  - [x] Magic link authentication
  - [x] Order status display
  - [x] CV download when ready
  - [x] Revision request form
- [x] **Admin Backoffice** (password protected)
  - [x] Dashboard with stats and orders table
  - [x] Order detail view with timeline
  - [x] "Awaiting Details" badge for pending_details orders
  - [x] CV Review panel (AI grades, notes, prompts)
  - [x] Leads management page
  - [x] Billing overview page
  - [x] Settings page
- [x] **Supabase Integration** (database + file storage)
  - [x] Full schema with 6 tables
  - [x] API routes with JSON fallback
  - [x] File upload to Supabase Storage

### Not Built (Future Phases)
- [ ] User accounts / customer dashboard
- [ ] Referral tracking system
- [ ] Email automation / sequences
- [ ] Analytics beyond Vercel basics

## Key Decisions Made

1. **$30 single price** - PMF validation, not tiered pricing yet
2. **Payment-first flow** - Pay first, then provide details (reduces friction)
3. **Lead capture at Step 1** - Before payment, email captured in leads table
4. **Taxfix-style details form** - Vertical stepper, collapsible sections, edit buttons
5. **Magic link authentication** - Customers access orders via email token, no login required
6. **Friendly design** - Coral (#FF6B6B), cream (#FFFBF5), navy (#2D3748)
7. **Inter font** - Clean, readable, universally available
8. **OpenAI GPT-4** - For free CV audit grading
9. **Skill-based grading** - CV Reviewer skill can be refined independently
10. **Supabase** - PostgreSQL database + file storage (with JSON fallback)
11. **Simple admin auth** - Password-based, cookie session (upgradeable later)

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **CV Parsing**: pdf-parse (PDF) + mammoth (DOCX)
- **LLM**: OpenAI GPT-4 (lazy initialization)
- **Database**: Supabase (PostgreSQL) with JSON file fallback
- **File Storage**: Supabase Storage (cv-files bucket)
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel

### Key Files
```
applybetter/
├── CHANGELOG.md              # Change tracking
├── PROJECT_CONTEXT.md        # This file
├── .env.example              # Environment variables template
├── .env.local                # Local environment (gitignored)
├── middleware.ts             # Admin route protection
├── app/
│   ├── page.tsx              # Landing page (14 sections)
│   ├── form/page.tsx         # 2-step checkout (name/email + payment)
│   ├── order/
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Customer order status page
│   │   │   └── complete/page.tsx  # Taxfix-style details form
│   │   └── lookup/page.tsx   # Order lookup by ID + email
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Warm theme CSS
│   ├── admin/                # Admin backoffice
│   │   ├── layout.tsx        # Admin layout
│   │   ├── page.tsx          # Redirects to /admin/orders
│   │   ├── login/            # Login page
│   │   ├── orders/           # Orders list + detail
│   │   ├── submissions/      # Legacy (same as orders)
│   │   ├── leads/            # Leads management
│   │   ├── billing/          # Billing overview
│   │   └── settings/         # Settings page
│   └── api/
│       ├── grade-cv/         # CV grading endpoint
│       ├── submit-intake/    # Creates order after payment (minimal data)
│       ├── capture-lead/     # Email capture endpoint
│       ├── create-payment-intent/  # Stripe payment intent
│       ├── order/
│       │   ├── [id]/
│       │   │   ├── route.ts      # Get order details
│       │   │   ├── details/route.ts  # Update order with full details
│       │   │   └── revision/route.ts # Submit revision request
│       │   └── generate-token/route.ts  # Generate magic link token
│       └── admin/            # Admin API routes
│           ├── login/        # Auth
│           ├── logout/       # Auth
│           ├── orders/       # Orders CRUD
│           ├── submissions/  # Legacy (same as orders)
│           ├── stats/        # Dashboard stats
│           ├── notes/        # Review notes
│           ├── payments/     # Payment tracking
│           └── leads/        # Lead management
├── components/
│   ├── sections/             # 14 landing page sections
│   ├── form/                 # Form components
│   │   ├── IntakeForm.tsx    # 2-step checkout orchestrator
│   │   ├── CheckoutPayment.tsx  # Stripe payment step
│   │   ├── Step1BasicInfo.tsx   # Name/email (generic)
│   │   └── Step2-8*.tsx      # Legacy full form steps
│   ├── admin/                # Admin components
│   │   ├── AdminNav.tsx      # Sidebar navigation
│   │   ├── AdminShell.tsx    # Page wrapper + header with logout
│   │   ├── OrdersTable.tsx   # Orders list with "Awaiting Details" badge
│   │   └── ...               # Other admin components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── openai.ts             # OpenAI client (lazy init)
│   ├── cv-parser.ts          # PDF/DOCX parsing
│   ├── cv-reviewer-skill.ts  # Grading logic
│   ├── form-schema.ts        # Zod schemas
│   ├── supabase.ts           # Supabase client + helpers
│   ├── stripe.ts             # Stripe client
│   ├── resend.ts             # Resend email client
│   ├── email-templates.ts    # Email HTML templates
│   ├── order-tokens.ts       # Magic link token generation/verification
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
  - `status`: `pending_details` | `pending` | `in_progress` | `review` | `completed` | `delivered` | `refunded`
  - `pending_details` = paid but waiting for CV/details
  - `pending` = ready for processing
- **ai_grades** - ChatGPT CV analysis results
- **review_notes** - Admin notes/prompts for each submission
- **payments** - Payment tracking (Stripe integration)
- **leads** - Email captures from Step 1 (before payment)
- **activity_log** - Audit trail of all actions

**Note**: Column is `current_job_role` (not `current_role` - reserved keyword)

### CV Reviewer Skill (Separate)
**Location**: `~/.cursor/skills-cursor/cv-reviewer/SKILL.md`

This skill contains recruiter expertise and is referenced by the grading API. It can be refined independently without changing code.

## User Flows

### Primary Flow (Paid CV Rewrite - Payment First)
1. Landing page → "Revamp your CV" CTA
2. **Step 1**: Enter name + email (lead captured to `leads` table)
3. **Step 2**: Stripe payment ($30)
4. Order created with `pending_details` status
5. Redirect to `/order/[id]/complete` (Taxfix-style form)
6. Customer completes 4 sections:
   - Upload CV
   - Career goals (industries, job titles, timeline, location)
   - Experience (current role, achievements, challenges)
   - Final details (cover letter, certifications, tools)
7. Status changes to `pending`, order ready for processing
8. Admin reviews in backoffice at /admin/orders
9. Manual CV rewrite by founder
10. Delivery via email in 48-96 hours
11. Customer can view status/download at `/order/[id]`

### Secondary Flow (Free Audit Lead Magnet)
1. Landing page → "Free quick audit" CTA
2. CV Upload modal opens
3. AI grades CV using CV Reviewer skill
4. Show basic score (overall + 3 issues)
5. Email gate for full report
6. Lead captured to `leads` table
7. Full report + upsell to $30 rewrite

### Admin Backoffice Flow
1. Visit /admin → redirected to /admin/orders
2. Enter admin password
3. Orders page shows all submissions
   - "Paid" + "Awaiting Details" badges for `pending_details` orders
   - "Paid" badge only for orders with complete details
4. Click order to view details
5. CV Review tab: see AI analysis, add notes/prompts
6. Update status as work progresses
7. Mark as delivered when complete

## Environment Variables

```bash
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://flffcpfnxalqkysfwqhl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Required for Emails
RESEND_API_KEY=re_...

# Required for Magic Links
ORDER_TOKEN_SECRET=any-random-secret-string

# Admin Access
ADMIN_PASSWORD=your-admin-password

# Optional
OPENAI_API_KEY=sk-...  # For CV grading
RESEND_FROM_EMAIL=ApplyBetter <noreply@yourdomain.com>  # Requires verified domain
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

**Admin Backoffice**: http://localhost:3000/admin

## Supabase Setup

1. Go to https://supabase.com/dashboard/project/flffcpfnxalqkysfwqhl
2. **Storage** → Create bucket "cv-files" (private)
3. **SQL Editor** → paste contents of `lib/db/schema.sql` → Run
4. **Settings** → **API** → copy `service_role` key to Vercel/`.env.local`

## Vercel Environment Variables

Required in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `ORDER_TOKEN_SECRET`
- `ADMIN_PASSWORD`

## What's Next

After MVP validation:
1. ~~Stripe payment integration~~ ✅ Done
2. ~~Customer order status page~~ ✅ Done
3. ~~Email confirmation/delivery~~ ✅ Done
4. Referral tracking ($5 per referral)
5. LinkedIn profile optimization add-on
6. Cover letter add-on
7. Email automation sequences
8. Customer accounts (optional)

## Important Notes for Future Agents

1. **Always update CHANGELOG.md** after making changes
2. **CV Reviewer skill is separate** - at ~/.cursor/skills-cursor/cv-reviewer/SKILL.md
3. **Copy tone is casual/honest** - avoid corporate speak
4. **Design is warm** - coral (#FF6B6B), cream (#FFFBF5), soft navy (#2D3748)
5. **Payment-first flow** - Checkout is 2 steps, details collected after payment
6. **Magic links for customers** - No login required, token-based access
7. **OpenAI uses lazy init** - won't fail at build time without API key
8. **Supabase is required in production** - APIs fall back to JSON files if not configured
9. **Database column** - Use `current_job_role` not `current_role` (reserved keyword)
10. **Storage bucket** - create "cv-files" bucket in Supabase Storage
11. **Order statuses**:
    - `pending_details` = paid, waiting for CV/details
    - `pending` = ready for processing
    - `in_progress`, `review`, `completed`, `delivered`, `refunded`
