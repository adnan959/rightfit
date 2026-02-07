"use client";

import Image from "next/image";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

export function QuickIntro() {
  return (
    <section className="py-20 md:py-28 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          {/* Centered heading above the grid */}
          <p className="text-coral font-semibold text-sm uppercase tracking-wider mb-3 text-center">
            Who am I?
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10">
            Hi, I&apos;m Naba. A Recruiter, Talent Specialist &amp; CV Expert.
          </h2>

          <div className="md:grid md:grid-cols-5 md:gap-12 md:items-center">
            {/* Left column - text */}
            <div className="md:col-span-3 mb-10 md:mb-0">
              <div className="space-y-4 text-lg text-navy-light">
                <p>
                  I&apos;ve spent years in recruitment and talent acquisition,
                  working with companies to find the right people. Along the way,
                  I&apos;ve reviewed thousands of CVs and I&apos;ve been helping
                  friends and family fix theirs for years.
                </p>

                <p>
                  The results were honestly{" "}
                  <span className="font-semibold text-navy">stupid good</span>.
                </p>

                <p>And everyone kept telling me:</p>

                <blockquote className="border-l-4 border-coral pl-4 py-2 my-6 bg-secondary rounded-r-lg">
                  <p className="text-xl font-medium text-navy italic">
                    &quot;You literally know what recruiters look for — why
                    isn&apos;t this a business?&quot;
                  </p>
                </blockquote>

                <p className="text-xl font-medium text-navy">
                  <span className="font-bold">So here I am.</span> Turning years
                  of insider recruiting knowledge into a CV rewrite service.
                </p>
              </div>
            </div>

            {/* Right column - photo with decorative shapes */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative w-64 h-72 sm:w-72 sm:h-80 md:w-full md:h-auto md:aspect-[4/5]">
                <div className="absolute -top-4 -right-4 w-[85%] h-[85%] bg-coral/15 rounded-2xl rotate-3" />
                <div className="absolute -bottom-3 -left-3 w-16 h-16 sm:w-20 sm:h-20 bg-[#FCD779]/40 rounded-xl -rotate-6" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-soft">
                  <Image
                    src="/naba.jpeg"
                    alt="Naba Malik - founder of ApplyBetter"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 288px, 320px"
                    priority={false}
                  />
                </div>
                <div className="absolute -top-2 -left-2 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-coral/30" />
                  <div className="w-2 h-2 rounded-full bg-coral/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
