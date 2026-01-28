"use client";

import { MessageSquare, FileText, Mail } from "lucide-react";

export function Proof() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Proof{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (trust without fake stats)
          </span>
        </h2>

        <p className="text-lg text-navy-light mb-4">
          I&apos;m not going to throw random numbers at you.
        </p>

        <p className="text-lg text-navy mb-8">
          What I can tell you is what I&apos;ve personally seen happen after a
          CV rewrite:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-coral" />
            </div>
            <p className="text-navy">
              People who were stuck{" "}
              <span className="font-medium">finally started getting replies</span>
            </p>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-coral" />
            </div>
            <p className="text-navy">
              People who had good experience but weak positioning{" "}
              <span className="font-medium">started getting taken seriously</span>
            </p>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-coral" />
            </div>
            <p className="text-navy">
              People who were applying everywhere{" "}
              <span className="font-medium">
                started targeting properly and seeing traction
              </span>
            </p>
          </div>
        </div>

        {/* Placeholder for future proof */}
        <div className="bg-muted rounded-xl p-6 border border-dashed border-border">
          <p className="text-muted-foreground text-center">
            <span className="font-medium">Coming soon:</span> Before/after
            snippets, text screenshots, and recruiter messages
          </p>
        </div>
      </div>
    </section>
  );
}
