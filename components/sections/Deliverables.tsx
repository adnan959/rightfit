"use client";

import { Check, X } from "lucide-react";

export function Deliverables() {
  const whatYouGet = [
    "A rewritten CV that's ready to send",
    "Strong bullet points that show ownership, outcomes and impact",
    "Clean structure that reads well",
    "ATS-safe formatting (no fancy designs that break systems)",
  ];

  const whatIWontDo = [
    "No fake numbers",
    "No generic templates",
    "No keyword stuffing that reads weird",
    "No lying about titles",
    "No 4-page CVs unless it truly makes sense",
    "No over-design that breaks ATS",
  ];

  return (
    <section id="what-you-get" className="py-16 md:py-20 px-4 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-8">
          What you get{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (clear deliverables)
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* What you get */}
          <div className="bg-success/5 rounded-xl p-6 border border-success/20">
            <h3 className="text-lg font-semibold text-navy mb-4">
              You&apos;ll get:
            </h3>
            <ul className="space-y-3">
              {whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="flex-shrink-0 w-5 h-5 text-success mt-0.5" />
                  <span className="text-navy-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What I won't do */}
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-navy mb-4">
              What I will NOT do:
            </h3>
            <ul className="space-y-3">
              {whatIWontDo.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="flex-shrink-0 w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-navy-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
