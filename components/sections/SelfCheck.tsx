"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { HelpCircle } from "lucide-react";

const painPoints = [
  {
    before: "You apply to roles you're qualified for and ",
    emphasis: "hear nothing back",
    after: "...",
  },
  {
    before: "Your CV ",
    emphasis: "reads like a job description",
    after: " instead of showing results...",
  },
  {
    before: "Your best work is ",
    emphasis: "buried halfway down",
    after: " and recruiters never see it...",
  },
  {
    before: "You've got experience but your ",
    emphasis: "impact isn't obvious",
    after: " at first glance...",
  },
  {
    before: "Your CV is ",
    emphasis: "longer than it needs to be",
    after: " and hard to scan quickly...",
  },
  {
    before: "You're ",
    emphasis: "not sure what's wrong",
    after: " but something clearly isn't working...",
  },
];

const indents = [
  "md:pl-0",
  "md:pl-10",
  "md:pl-20",
  "md:pl-10",
  "md:pl-20",
  "md:pl-28",
];

export function SelfCheck() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-12">
            If this sounds like you...
          </h2>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-border shadow-soft p-6 md:p-10 mb-12">
            <div className="flex flex-col gap-3">
              {painPoints.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 bg-coral/5 rounded-xl"
                >
                  <HelpCircle className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-coral" />
                  <p className="text-base md:text-lg text-navy leading-relaxed">
                    {item.before}
                    <span className="font-bold underline decoration-coral underline-offset-4">
                      {item.emphasis}
                    </span>
                    {item.after}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-navy-light mb-6">
              If that&apos;s you, it&apos;s alright. This is exactly what we fix.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-coral hover:bg-coral-dark text-white px-8 py-6 text-lg rounded-full shadow-warm transition-all hover:scale-105"
            >
              <Link href="/form">Upload your CV</Link>
            </Button>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
