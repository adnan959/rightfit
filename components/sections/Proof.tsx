"use client";

import { MessageSquare, FileText, Mail } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function Proof() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-6">
            Real results
          </h2>

          <div className="text-center mb-10">
            <p className="text-lg text-navy-light mb-4">
              I&apos;m not going to throw random numbers at you.
            </p>

            <p className="text-lg text-navy">
              What I can tell you is what I&apos;ve personally seen happen after a
              CV rewrite:
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-border shadow-soft text-left">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-coral" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy mb-1">Started getting replies</h3>
                <p className="text-navy-light">
                  People who were stuck finally started hearing back from recruiters after their CV rewrite.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-border shadow-soft text-left">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-coral" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy mb-1">Taken seriously</h3>
                <p className="text-navy-light">
                  People who had good experience but weak positioning started getting taken seriously.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-border shadow-soft text-left">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-coral" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy mb-1">Real traction</h3>
                <p className="text-navy-light">
                  People who were applying everywhere started targeting properly and seeing real traction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
