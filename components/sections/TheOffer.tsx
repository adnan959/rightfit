"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TheOffer() {
  return (
    <section id="pricing" className="py-16 md:py-20 px-4 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          The offer{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (less &quot;gimme&quot;, more &quot;here&apos;s help&quot;)
          </span>
        </h2>

        <div className="text-center mb-8">
          <p className="text-4xl md:text-5xl font-bold text-coral mb-4">$30</p>
          <p className="text-lg text-navy-light">
            I&apos;m not going to gas you up with &quot;best investment
            ever&quot;.
          </p>
        </div>

        <p className="text-lg text-navy-light mb-6">
          It&apos;s just a small price to stop your CV from quietly sabotaging
          you every time you apply.
        </p>

        <div className="bg-secondary rounded-xl p-6 border border-border mb-8">
          <p className="text-lg text-navy mb-2">Think of it like this:</p>
          <p className="text-navy-light mb-4">It&apos;s one nice dinner out.</p>
          <p className="text-navy">
            But instead of spending it and forgetting it, you spend it on
            something that{" "}
            <span className="font-semibold">
              improves your odds every time you apply
            </span>
            .
          </p>
        </div>

        <div className="text-center mb-6">
          <Button
            asChild
            size="lg"
            className="bg-coral hover:bg-coral-dark text-white px-10 py-6 text-xl rounded-full shadow-warm transition-all hover:scale-105"
          >
            <Link href="/form">Start your CV Revamp</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center italic">
          PS - I&apos;m keeping it low because I&apos;m validating PMF for this
          service.
        </p>
      </div>
    </section>
  );
}
