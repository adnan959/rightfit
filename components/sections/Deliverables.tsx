"use client";

import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

const whatYouGet = [
  "Ready-to-send CV",
  "Impact-first bullet points",
  "Clean, scannable structure",
  "ATS-safe formatting",
  "Ownership & outcomes highlighted",
  "Concise — no fluff",
  "Sounds like you, just sharper",
  "Delivered in 48–96 hours",
];

const whatIWontDo = [
  "No fake numbers",
  "No generic templates",
  "No keyword stuffing",
  "No lying about titles",
  "No over-design that breaks ATS",
];

export function Deliverables() {
  return (
    <section
      id="what-you-get"
      className="py-12 md:py-16 px-4 scroll-mt-20"
    >
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10">
            What you get
          </h2>

          {/* Pill tag cloud in bounding box */}
          <div className="mx-auto bg-white rounded-2xl border border-border shadow-soft p-4 md:p-6 mb-10">
            <div className="flex flex-wrap justify-center gap-3">
              {whatYouGet.map((item, index) => (
                <span
                  key={index}
                  className="border-2 border-coral rounded-full px-6 py-3 text-coral font-semibold text-sm md:text-base whitespace-nowrap"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* What I won't do - pill cloud */}
          <h3 className="text-lg md:text-xl font-bold text-navy mb-6 text-center">
            What I will NOT do:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {whatIWontDo.map((item, index) => (
              <span
                key={index}
                className="border-2 border-navy-light/30 rounded-full px-6 py-3 text-navy-light font-semibold text-sm md:text-base whitespace-nowrap"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
