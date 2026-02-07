"use client";

import { FileText, Sparkles, Mail } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      step: "01",
      title: "You fill out the form",
      description:
        "With as much detail as possible. The more context you give me, the better the CV gets.",
    },
    {
      icon: Sparkles,
      step: "02",
      title: "I rewrite your CV",
      description: "So it's easy to scan, impact-first, ATS-safe, and still sounds like you — just sharper.",
    },
    {
      icon: Mail,
      step: "03",
      title: "You get the finished CV",
      description: "By email in 48–96 hours. Ready to send.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-16 px-4 scroll-mt-20">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10">
            How it works
          </h2>

          <div className="space-y-6 max-w-2xl mx-auto mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-border shadow-soft text-left"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-coral" />
                </div>
                <div>
                  <span className="text-xs font-bold text-coral/60 uppercase tracking-wider">
                    Step {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-navy mt-1 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-navy-light">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary rounded-xl p-6 border border-border max-w-2xl mx-auto text-center">
            <p className="text-navy-light">
              You don&apos;t need perfect wording. You don&apos;t need perfect
              numbers.
            </p>
            <p className="text-navy font-medium mt-2">
              You just need to tell me what&apos;s real.
            </p>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
