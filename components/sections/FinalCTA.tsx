"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24 px-4 bg-white scroll-mt-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-coral/5 rounded-full blur-3xl" />
      </div>

      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Ready to fix your CV?
          </h2>

          <p className="text-xl md:text-2xl text-navy-light mb-8 max-w-xl mx-auto">
            If you&apos;re tired of applying and getting ghosted, send it over.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-coral hover:bg-coral-dark text-white px-12 py-7 text-2xl rounded-full shadow-warm transition-all hover:scale-105"
          >
            <Link href="/form">Start your CV Revamp</Link>
          </Button>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
