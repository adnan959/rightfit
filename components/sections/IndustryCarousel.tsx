"use client";

import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

interface CVData {
  fullName: string;
  contact: string;
  summary: string;
  sections: { heading: string; items: string[] }[];
}

interface Industry {
  name: string;
  role: string;
  cv: CVData;
}

const industries: Industry[] = [
  {
    name: "Technology",
    role: "Software Engineer",
    cv: {
      fullName: "James Chen",
      contact: "London | james.chen@email.com | +44 7700 900123",
      summary:
        "Full-stack engineer with 6 years building scalable web platforms and cloud-native applications for high-growth SaaS companies.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Led migration of monolith to microservices architecture, reducing deployment time by 70% and improving system reliability to 99.9% uptime.",
            "Built real-time data pipeline processing 2M+ events daily using Kafka and Node.js, enabling instant analytics for product teams.",
            "Mentored 4 junior engineers and established code review standards adopted across 3 engineering squads.",
          ],
        },
        {
          heading: "Skills",
          items: [
            "React, TypeScript, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, Redis, GraphQL",
          ],
        },
      ],
    },
  },
  {
    name: "Finance",
    role: "Financial Analyst",
    cv: {
      fullName: "Sarah Mitchell",
      contact: "Manchester | s.mitchell@email.com | +44 7700 900456",
      summary:
        "Detail-oriented financial analyst with 5 years in corporate finance, specialising in forecasting, budgeting, and strategic financial planning.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Developed quarterly forecasting models that improved budget accuracy by 25%, directly informing C-suite investment decisions.",
            "Managed financial reporting for a £40M portfolio, identifying £2.1M in cost savings through variance analysis.",
            "Automated month-end close process using Power BI and VBA, cutting reporting time from 5 days to 2.",
          ],
        },
        {
          heading: "Certifications",
          items: ["CFA Level II Candidate | ACCA Qualified | Bloomberg Terminal Certified"],
        },
      ],
    },
  },
  {
    name: "Marketing",
    role: "Marketing Manager",
    cv: {
      fullName: "Priya Sharma",
      contact: "Birmingham | priya.sharma@email.com | +44 7700 900789",
      summary:
        "Growth-focused marketer with 7 years driving B2B acquisition across paid, organic, and content channels for technology companies.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Scaled inbound lead generation from 200 to 1,400 MQLs per month through content marketing and SEO strategy overhaul.",
            "Managed £500K annual ad budget across LinkedIn, Google, and Meta — reduced CAC by 35% while increasing SQL volume by 60%.",
            "Built and led a 6-person marketing team covering demand gen, content, design, and marketing ops.",
          ],
        },
        {
          heading: "Skills",
          items: [
            "HubSpot, Google Ads, LinkedIn Ads, SEMrush, Figma, Google Analytics, Salesforce, Webflow",
          ],
        },
      ],
    },
  },
  {
    name: "Healthcare",
    role: "Clinical Researcher",
    cv: {
      fullName: "Dr. Amara Osei",
      contact: "Edinburgh | a.osei@email.com | +44 7700 900234",
      summary:
        "Clinical researcher with 8 years in oncology trials, experienced in study design, regulatory submissions, and cross-functional team leadership.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Co-led Phase III clinical trial (n=1,200) resulting in FDA breakthrough therapy designation for novel immunotherapy agent.",
            "Published 12 peer-reviewed papers in leading journals including The Lancet Oncology and JAMA.",
            "Coordinated multi-site trial logistics across 8 hospitals, ensuring 98% protocol compliance.",
          ],
        },
        {
          heading: "Education",
          items: [
            "PhD Clinical Medicine, University of Cambridge | MBBS, King's College London",
          ],
        },
      ],
    },
  },
  {
    name: "Consulting",
    role: "Strategy Consultant",
    cv: {
      fullName: "Oliver Park",
      contact: "London | o.park@email.com | +44 7700 900567",
      summary:
        "Strategy consultant with 4 years at a Big Four firm, specialising in digital transformation and operational efficiency for FTSE 250 clients.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Led workstream on £15M digital transformation programme for a retail client, delivering 20% reduction in operational costs.",
            "Conducted market entry analysis for 3 emerging markets, directly shaping board-level investment strategy.",
            "Facilitated 30+ executive workshops and stakeholder alignment sessions across complex multi-party engagements.",
          ],
        },
        {
          heading: "Education",
          items: [
            "MBA, London Business School | BSc Economics, LSE | Lean Six Sigma Green Belt",
          ],
        },
      ],
    },
  },
  {
    name: "Engineering",
    role: "Mechanical Engineer",
    cv: {
      fullName: "Fatima Al-Rashid",
      contact: "Bristol | f.alrashid@email.com | +44 7700 900890",
      summary:
        "Chartered mechanical engineer with 6 years in automotive and aerospace, specialising in structural analysis and product design optimisation.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Redesigned suspension assembly for EV platform, reducing component weight by 18% while maintaining safety factor of 2.5.",
            "Led FEA validation for turbine blade redesign — passed all certification tests first attempt, saving £400K in re-testing costs.",
            "Managed supplier relationships across 5 countries for precision-machined components with <0.02mm tolerance.",
          ],
        },
        {
          heading: "Skills",
          items: [
            "SolidWorks, ANSYS, CATIA, AutoCAD, MATLAB, GD&T, ISO 9001, APQP",
          ],
        },
      ],
    },
  },
  {
    name: "Education",
    role: "Program Coordinator",
    cv: {
      fullName: "David Okonkwo",
      contact: "Leeds | d.okonkwo@email.com | +44 7700 900345",
      summary:
        "Education professional with 5 years designing and managing student success programmes across further and higher education institutions.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Designed and launched mentorship programme connecting 400+ students with industry professionals, achieving 92% satisfaction rating.",
            "Secured £180K in grant funding for widening participation initiatives targeting underrepresented communities.",
            "Coordinated cross-departmental curriculum review resulting in 15% improvement in student retention rates.",
          ],
        },
        {
          heading: "Education",
          items: [
            "MA Education Policy, UCL Institute of Education | PGCE, University of Leeds",
          ],
        },
      ],
    },
  },
  {
    name: "Operations",
    role: "Supply Chain Manager",
    cv: {
      fullName: "Rachel Thompson",
      contact: "Glasgow | r.thompson@email.com | +44 7700 900678",
      summary:
        "Operations leader with 8 years optimising end-to-end supply chains, reducing costs and improving delivery performance for FMCG and retail brands.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Renegotiated logistics contracts across 3 regions, delivering £1.2M annual savings while improving on-time delivery to 97%.",
            "Implemented demand forecasting system using SAP IBP, reducing excess inventory by 30% and stockouts by 45%.",
            "Led warehouse automation project — increased throughput by 40% with same headcount through layout redesign and WMS upgrade.",
          ],
        },
        {
          heading: "Certifications",
          items: [
            "CSCP (APICS) | Prince2 Practitioner | SAP MM/SD Certified",
          ],
        },
      ],
    },
  },
  {
    name: "Sales",
    role: "Account Executive",
    cv: {
      fullName: "Marcus Rivera",
      contact: "London | m.rivera@email.com | +44 7700 900901",
      summary:
        "Enterprise sales professional with 5 years closing complex B2B deals in SaaS, consistently exceeding quota and building long-term client partnerships.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Closed £3.2M in new business ARR in FY24, achieving 145% of annual quota and ranking #1 across EMEA sales team.",
            "Built and managed pipeline of 60+ enterprise accounts with average deal size of £85K, maintaining 35% win rate.",
            "Developed strategic account plans for 5 key clients, driving 120% net revenue retention through upsell and expansion.",
          ],
        },
        {
          heading: "Skills",
          items: [
            "Salesforce, Gong, LinkedIn Sales Navigator, MEDDIC, SPIN Selling, Challenger Sale",
          ],
        },
      ],
    },
  },
  {
    name: "Design",
    role: "Product Designer",
    cv: {
      fullName: "Lena Virtanen",
      contact: "Brighton | l.virtanen@email.com | +44 7700 900112",
      summary:
        "Product designer with 6 years crafting user-centred experiences for mobile and web, with a strong foundation in research, prototyping, and design systems.",
      sections: [
        {
          heading: "Experience",
          items: [
            "Redesigned onboarding flow for fintech app — increased activation rate by 28% and reduced support tickets by 40%.",
            "Built and maintained design system used by 4 product teams, ensuring consistency across 12 product surfaces.",
            "Conducted 50+ user research sessions and usability tests, translating findings into actionable design improvements.",
          ],
        },
        {
          heading: "Skills",
          items: [
            "Figma, Framer, Principle, UserTesting, Maze, HTML/CSS, Tailwind, Storybook",
          ],
        },
      ],
    },
  },
];

function MiniCV({ cv }: { cv: CVData }) {
  return (
    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-white border border-border/60 select-none pointer-events-none">
      <div className="p-3 space-y-1.5 leading-none">
        {/* Name */}
        <p className="text-[6px] font-bold text-navy truncate">{cv.fullName}</p>

        {/* Contact */}
        <p className="text-[4px] text-navy-light truncate">{cv.contact}</p>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Summary */}
        <p className="text-[4px] text-navy-light leading-[1.4]">{cv.summary}</p>

        {/* Sections */}
        {cv.sections.map((section, i) => (
          <div key={i} className="space-y-0.5">
            {/* Section heading */}
            <div className="flex items-center gap-1 mt-1">
              <p className="text-[5px] font-bold text-navy whitespace-nowrap">
                {section.heading}
              </p>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Items */}
            {section.items.map((item, j) => (
              <p
                key={j}
                className="text-[4px] text-navy-light leading-[1.4] pl-1"
              >
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <div className="flex-shrink-0 w-56 sm:w-60 md:w-64 bg-white rounded-xl p-5 shadow-soft border border-border">
      {/* CV Preview thumbnail */}
      <MiniCV cv={industry.cv} />

      {/* Label */}
      <div className="mt-4 text-center">
        <p className="font-bold text-navy text-base">{industry.name}</p>
        <p className="text-sm text-navy-light mt-1">{industry.role}</p>
      </div>
    </div>
  );
}

export function IndustryCarousel() {
  const doubled = [...industries, ...industries];

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <AnimateOnScroll>
        <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10 px-4">
          Industries we rewrite for
        </h2>
      </AnimateOnScroll>

      <div className="overflow-hidden w-full">
        <div className="flex gap-4 animate-carousel hover:[animation-play-state:paused]">
          {doubled.map((industry, index) => (
            <IndustryCard key={index} industry={industry} />
          ))}
        </div>
      </div>
    </section>
  );
}
