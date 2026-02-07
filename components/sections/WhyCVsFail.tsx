"use client";

import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

const problems = [
  {
    title: "Rambling for pages",
    description:
      "Your CV is 3+ pages of everything you've ever done, making it impossible for a recruiter to find what matters.",
  },
  {
    title: "Tasks instead of outcomes",
    description:
      "You list what you were responsible for, not what you actually achieved or improved.",
  },
  {
    title: "Best work is buried",
    description:
      "Your strongest accomplishments are hidden halfway down, and recruiters stop reading after 10 seconds.",
  },
  {
    title: "Nothing is quantified",
    description:
      "There are no numbers, percentages, or timeframes — so your impact is invisible.",
  },
  {
    title: "Irrelevant details",
    description:
      "Full home addresses, photos, or random personal info that wastes space and distracts.",
  },
  {
    title: "Trying to sound impressive",
    description:
      "Overcomplicated language that makes it harder to understand what you actually did.",
  },
];

export function WhyCVsFail() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          {/* Headline */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
              Common reasons CVs get rejected
            </h2>
            <p className="text-lg md:text-xl text-navy-light">
              <span className="font-bold underline decoration-coral underline-offset-4">
                Most CV rejections
              </span>{" "}
              happen for boring, fixable reasons
            </p>
          </div>

          {/* Card container */}
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-soft border border-border">
            <div className="flex flex-col gap-3">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className="bg-coral/5 rounded-xl px-6 md:px-8 py-5"
                >
                  <p className="text-base md:text-lg text-navy leading-relaxed">
                    <span className="font-bold">{problem.title}:</span>{" "}
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing text */}
          <div className="space-y-4 mt-10 text-center">
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
      </AnimateOnScroll>
    </section>
  );
}
