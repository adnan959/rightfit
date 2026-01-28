"use client";

import { Check, X } from "lucide-react";

export function WhoThisIsFor() {
  const forYou = [
    "You're qualified but getting ghosted",
    "You've got experience but it's not showing clearly",
    "You want a clean, modern CV without fluff",
  ];

  const notForYou = [
    "You want a job guarantee",
    "You want me to invent achievements",
    "You want a fancy designed resume more than results",
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-8">
          Who this is for / not for
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* For you */}
          <div className="bg-success/5 rounded-xl p-6 border border-success/20">
            <h3 className="text-lg font-semibold text-navy mb-4">
              This is for you if:
            </h3>
            <ul className="space-y-3">
              {forYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="flex-shrink-0 w-5 h-5 text-success mt-0.5" />
                  <span className="text-navy-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not for you */}
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-navy mb-4">
              Not for you if:
            </h3>
            <ul className="space-y-3">
              {notForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="flex-shrink-0 w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-navy-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
