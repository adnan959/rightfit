"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function TheOffer() {
  return (
    <section id="pricing" className="py-12 md:py-16 px-4 scroll-mt-20">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10">
            The offer
          </h2>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-border shadow-soft p-8 md:p-10">
            <div className="md:grid md:grid-cols-2 md:gap-10 md:items-center">
              {/* Left column - price & context */}
              <div className="text-center md:text-left mb-8 md:mb-0">
                <p className="text-6xl md:text-7xl font-extrabold text-coral mb-2">$30</p>
                <p className="text-lg text-navy-light mb-6">
                  One CV rewrite. Ready to send in 48-96 hours.
                </p>

                <div className="bg-secondary rounded-xl p-5 border border-border text-left">
                  <p className="text-lg text-navy mb-2">Think of it like this:</p>
                  <p className="text-navy-light mb-3">It&apos;s one nice dinner out.</p>
                  <p className="text-navy">
                    But instead of spending it and forgetting it, you spend it on
                    something that{" "}
                    <span className="font-semibold">
                      improves your odds every time you apply
                    </span>
                    .
                  </p>
                </div>

                <p className="text-sm text-navy-light mt-6 italic">
                  PS - I&apos;m keeping it low because I want this to be accessible to
                  everyone who needs it.
                </p>
              </div>

              {/* Right column - CTA */}
              <div className="text-center">
                <p className="text-lg text-navy-light mb-8">
                  It&apos;s just a small price to stop your CV from quietly sabotaging
                  you every time you apply.
                </p>

                <Button
                  asChild
                  size="lg"
                  className="bg-coral hover:bg-coral-dark text-white px-14 py-7 text-2xl rounded-full shadow-warm transition-all hover:scale-105"
                >
                  <Link href="/form">Start your CV Revamp</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
