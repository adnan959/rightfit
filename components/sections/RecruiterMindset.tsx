"use client";

import { User, BarChart3, TrendingUp, Award, Eye } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import type { LucideIcon } from "lucide-react";

interface QuestionPill {
  icon: LucideIcon;
  label: string;
}

const questions: QuestionPill[] = [
  { icon: User, label: "What do you do?" },
  { icon: BarChart3, label: "What level are you?" },
  { icon: TrendingUp, label: "What did you actually improve?" },
  { icon: Award, label: "What impact did you make?" },
  { icon: Eye, label: "Should I keep reading?" },
];

export function RecruiterMindset() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Here&apos;s how it actually works
          </h2>

          <p className="text-lg text-navy-light mb-2 max-w-2xl mx-auto">
            Most recruiters aren&apos;t experts in your field. They&apos;ll scan
            your CV in under 10 seconds, trying to figure out:
          </p>

          {/* Stacked pills */}
          <div className="flex flex-col items-center gap-4 my-10">
            {questions.map((q, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-white rounded-full border border-border shadow-soft"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                  <q.icon className="w-4 h-4 text-coral" />
                </div>
                <span className="text-base md:text-lg font-semibold text-navy">
                  {q.label}
                </span>
              </div>
            ))}
          </div>

          {/* 10 seconds callout */}
          <div className="inline-flex flex-col items-center gap-1 mb-4">
            <p className="text-5xl md:text-6xl font-extrabold text-coral">10s</p>
            <p className="text-lg font-medium text-navy">
              Average time a recruiter spends on your CV
            </p>
          </div>

          <p className="text-navy-light max-w-lg mx-auto">
            If your CV doesn&apos;t answer those questions quickly,{" "}
            <span className="font-semibold text-navy">you get skipped</span>.
            Even if you&apos;re genuinely good.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
