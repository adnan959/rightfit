"use client";

import {
  Ghost,
  ArrowLeftRight,
  Layers,
  Briefcase,
  GraduationCap,
  Globe,
  X,
} from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import type { LucideIcon } from "lucide-react";

interface BenefitCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: BenefitCard[] = [
  {
    icon: Ghost,
    title: "Getting ghosted",
    description:
      "You're qualified for the roles you apply to, but you keep hearing nothing back.",
  },
  {
    icon: ArrowLeftRight,
    title: "Career changers",
    description:
      "You're switching industries and need help positioning your transferable skills.",
  },
  {
    icon: Layers,
    title: "Buried experience",
    description:
      "You've done great work but it's hidden in a messy, hard-to-scan CV.",
  },
  {
    icon: Briefcase,
    title: "Busy professionals",
    description:
      "You don't have the time or energy to rewrite your CV from scratch.",
  },
  {
    icon: GraduationCap,
    title: "Recent graduates",
    description:
      "You've got strong potential but your CV structure isn't doing you justice.",
  },
  {
    icon: Globe,
    title: "Non-native English speakers",
    description:
      "You have the skills but need clear, polished English copy that reads naturally.",
  },
];

const notForYou = [
  "You want a job guarantee",
  "You want me to invent achievements",
  "You want a fancy design over results",
];

export function WhoThisIsFor() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-10">
            Who is this for?
          </h2>

          {/* Card grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 md:p-8 shadow-soft border border-border"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-coral" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-navy mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-navy-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Not for you - compact bar */}
          <div className="mt-8 bg-white rounded-xl p-5 md:p-6 border border-border shadow-soft">
            <p className="text-sm font-semibold text-navy mb-3">
              Not for you if:
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {notForYou.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-navy-light"
                >
                  <X className="flex-shrink-0 w-4 h-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
