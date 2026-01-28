"use client";

import { X } from "lucide-react";

export function WhyCVsFail() {
  const problems = [
    "ramble for 3 pages",
    "list tasks instead of outcomes",
    "hide the best work under generic bullets",
    "Nothing is quantified",
    "include weird stuff like full addresses, photos, random details",
    "try to sound impressive instead of being clear",
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Why this exists{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (trust + intent)
          </span>
        </h2>

        <p className="text-xl font-medium text-navy mb-4">
          Most CVs fail for boring reasons.
        </p>

        <p className="text-lg text-navy-light mb-6">
          Not because the person is bad. But because the CV does things like:
        </p>

        <ul className="space-y-3 mb-8">
          {problems.map((problem, index) => (
            <li key={index} className="flex items-start gap-3">
              <X className="flex-shrink-0 w-5 h-5 text-coral mt-0.5" />
              <span className="text-navy-light">{problem}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <p className="text-lg text-navy">
            The good thing is…{" "}
            <span className="font-semibold text-coral">these are fixable</span>.
          </p>

          <p className="text-lg text-navy-light">
            The hard part is compressing your actual work into clean bullets
            that still feel true.
          </p>

          <p className="text-xl font-medium text-navy">
            That&apos;s what I help with.
          </p>
        </div>
      </div>
    </section>
  );
}
