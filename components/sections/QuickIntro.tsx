"use client";

export function QuickIntro() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Quick intro
        </h2>

        <div className="space-y-4 text-lg text-navy-light">
          <p>
            I&apos;ve worked in Fortune 500 companies and I&apos;ve been fixing
            CVs for friends and family for years, usually in exchange for food.
          </p>

          <p>
            The results were honestly{" "}
            <span className="font-semibold text-navy">stupid good</span>.
          </p>

          <p>And everyone kept telling me:</p>

          <blockquote className="border-l-4 border-coral pl-4 py-2 my-6 bg-secondary rounded-r-lg">
            <p className="text-xl font-medium text-navy italic">
              &quot;Bro, why isn&apos;t this a business?&quot;
            </p>
          </blockquote>

          <p className="text-xl font-medium text-navy">So here I am.</p>
        </div>
      </div>
    </section>
  );
}
