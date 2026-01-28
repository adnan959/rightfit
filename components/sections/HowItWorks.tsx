"use client";

import { FileText, Sparkles, Mail } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Step 1: You fill out the form",
      description:
        "with as much detail as possible. The more context you give me, the better the CV gets.",
    },
    {
      icon: Sparkles,
      title: "Step 2: I rewrite your CV",
      description: "so it's easy to scan, impact-first, ATS-safe, and still sounds like you, just sharper.",
    },
    {
      icon: Mail,
      title: "Step 3: You get the finished CV",
      description: "by email in 48–96 hours.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 px-4 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-8">
          How it works{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (simple process, supportive tone)
          </span>
        </h2>

        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 bg-white rounded-xl border border-border shadow-soft"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-coral" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy mb-1">
                  {step.title}
                </h3>
                <p className="text-navy-light">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary rounded-xl p-6 border border-border">
          <p className="text-navy-light">
            You don&apos;t need perfect wording. You don&apos;t need perfect
            numbers.
          </p>
          <p className="text-navy font-medium mt-2">
            You just need to tell me what&apos;s real.
          </p>
        </div>
      </div>
    </section>
  );
}
