"use client";

import { Gift } from "lucide-react";

export function Referral() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Referral program{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (optional, but keep it clean)
          </span>
        </h2>

        <div className="bg-gradient-to-br from-coral/10 to-coral/5 rounded-xl p-6 md:p-8 border border-coral/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-coral" />
            </div>
            <div>
              <p className="text-xl font-semibold text-navy mb-2">
                To make things really interesting...
              </p>
              <p className="text-lg text-navy-light">
                If you refer someone and they buy, you get{" "}
                <span className="font-bold text-coral">$5 cash</span>.
              </p>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 mb-4">
            <p className="text-navy">
              <span className="font-semibold">No cap.</span> If you refer 20
              people, you get{" "}
              <span className="font-bold text-coral">$100</span>, straight to
              your bank account.
            </p>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Referral tracking: Coming soon - you&apos;ll get a unique link after
            purchase.
          </p>
        </div>
      </div>
    </section>
  );
}
