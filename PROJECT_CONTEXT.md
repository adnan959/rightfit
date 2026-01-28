# Rightfit - Project Context

## What This Is

Rightfit is a $30 CV rewrite service targeting job seekers who are qualified but getting ghosted. The founder is a recruiter with Fortune 500 experience who has been fixing CVs informally for years.

**Core Value Prop**: "I rewrite your CV so your impact is obvious in seconds."

## Current State

### Built (MVP Complete)
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

### Not Built (Future Phases)
- [ ] Payment processing (Stripe) - currently manual invoicing
- [ ] User accounts / dashboard
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
8. **JSON file storage** - MVP approach, upgrade to database later

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **CV Parsing**: pdf-parse (PDF) + mammoth (DOCX)
- **LLM**: OpenAI GPT-4 (lazy initialization)
- **Storage**: JSON files in /data directory
- **Deployment**: Ready for Vercel

### Key Files
```
rightfit/
├── CHANGELOG.md              # Change tracking
├── PROJECT_CONTEXT.md        # This file
├── .env.example              # Environment variables template
├── app/
│   ├── page.tsx              # Landing page (14 sections)
│   ├── form/page.tsx         # 8-step intake form
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Warm theme CSS
│   └── api/
│       ├── grade-cv/         # CV grading endpoint
│       ├── submit-intake/    # Form submission endpoint
│       └── capture-lead/     # Email capture endpoint
├── components/
│   ├── sections/             # 14 landing page sections
│   ├── form/                 # 8 form step components
│   └── ui/                   # UI components
├── lib/
│   ├── openai.ts             # OpenAI client (lazy init)
│   ├── cv-parser.ts          # PDF/DOCX parsing
│   ├── cv-reviewer-skill.ts  # Grading logic
│   └── form-schema.ts        # Zod schemas
└── data/                     # Created at runtime
    ├── leads.json            # Captured emails
    └── submissions/          # Intake form submissions
```

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
3. Submission saved to /data/submissions/
4. Manual CV rewrite by founder
5. Delivery via email in 48-96 hours

### Secondary Flow (Free Audit Lead Magnet)
1. Landing page → "Free quick audit" CTA
2. CV Upload modal opens
3. AI grades CV using CV Reviewer skill
4. Show basic score (overall + 3 issues)
5. Email gate for full report
6. Lead captured to /data/leads.json
7. Full report + upsell to $30 rewrite

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-api-key-here
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

## What's Next

After MVP validation:
1. Stripe payment integration
2. Referral tracking ($5 per referral)
3. LinkedIn profile optimization add-on
4. Cover letter add-on
5. Email automation sequences
6. Database migration (from JSON files)

## Important Notes for Future Agents

1. **Always update CHANGELOG.md** after making changes
2. **CV Reviewer skill is separate** - at ~/.cursor/skills-cursor/cv-reviewer/SKILL.md
3. **Copy tone is casual/honest** - avoid corporate speak
4. **Design is warm** - coral (#FF6B6B), cream (#FFFBF5), soft navy (#2D3748)
5. **Form captures email early** - steps 1-2 for lead preservation
6. **OpenAI uses lazy init** - won't fail at build time without API key
7. **Data stored in JSON files** - /data/leads.json and /data/submissions/
