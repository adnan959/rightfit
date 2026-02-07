"use client";

import { TextReveal } from "@/components/ui/text-reveal";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function WhatYoureBuying() {
  return (
    <section className="px-4">
      {/* Scroll-driven text reveal */}
      <TextReveal>
        {"You're not paying for words. You're paying for the clarity that gets you noticed."}
      </TextReveal>

      {/* Supporting context */}
      <div className="py-12 md:py-16">
        <AnimateOnScroll>
          <div className="max-w-[1000px] mx-auto">
            <blockquote className="border-l-4 border-coral pl-4 py-4 my-6 bg-secondary rounded-r-lg text-left max-w-2xl mx-auto">
              <p className="text-xl text-navy">
                &quot;This is the real signal. This is what matters. This is how
                we say it clearly.&quot;
              </p>
            </blockquote>

            <div className="text-center space-y-3 text-lg text-navy-light max-w-2xl mx-auto">
              <p>
                When you write your own CV, you&apos;re too close to it.
              </p>
              <p className="text-navy font-medium">
                You either undersell yourself or over-explain everything.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
