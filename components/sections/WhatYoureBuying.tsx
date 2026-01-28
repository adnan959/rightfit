"use client";

export function WhatYoureBuying() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          What you&apos;re really buying{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (sets expectation, builds trust)
          </span>
        </h2>

        <div className="space-y-4 text-lg text-navy-light">
          <p>
            You&apos;re not paying me to &quot;write words&quot; or magically
            get you a job.
          </p>

          <p>
            You&apos;re paying for an outside perspective that can look at your
            experience and go:
          </p>

          <blockquote className="border-l-4 border-coral pl-4 py-4 my-6 bg-secondary rounded-r-lg">
            <p className="text-xl text-navy">
              &quot;Okay, this is the real signal. This is what matters. This is
              how we say it clearly.&quot;
            </p>
          </blockquote>

          <p>
            Because when you write your own CV, you&apos;re too close to it.
          </p>

          <p className="text-navy font-medium">
            You either undersell yourself or over-explain everything.
          </p>
        </div>
      </div>
    </section>
  );
}
