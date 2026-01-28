"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CVUploadModal } from "@/components/ui/CVUploadModal";

export function Hero() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  return (
    <>
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-6">
            If you applied to 10+ jobs this week and got nothing…{" "}
            <span className="text-coral">you probably have a CV problem.</span>
          </h1>

          {/* Subtext */}
          <div className="text-lg md:text-xl text-navy-light mb-8 space-y-4">
            <p>
              If you know you can do the job but you keep hearing nothing back,
              it&apos;s usually one of two things:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                Your CV is too vague
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                Your best work is buried
              </li>
            </ul>
          </div>

          {/* Value prop */}
          <p className="text-xl md:text-2xl font-medium text-navy mb-2">
            I rewrite your CV so your impact is obvious in seconds.
          </p>
          <p className="text-navy-light mb-8">
            Not &quot;nice&quot;. Not fluffy. Just clear.
          </p>

          {/* Price and CTAs */}
          <div className="mb-6">
            <p className="text-2xl md:text-3xl font-bold text-navy mb-4">
              $30 CV rewrite. Ready to send.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-coral hover:bg-coral-dark text-white px-8 py-6 text-lg rounded-full shadow-warm transition-all hover:scale-105"
              >
                <Link href="/form">Revamp your CV</Link>
              </Button>
              <span className="text-muted-foreground">or</span>
              <Button
                onClick={() => setIsAuditModalOpen(true)}
                variant="outline"
                size="lg"
                className="border-coral text-coral hover:bg-coral/5 px-6 py-6 text-lg rounded-full"
              >
                Free quick audit
              </Button>
            </div>
          </div>

          {/* Small note */}
          <p className="text-sm text-muted-foreground italic">
            Small note: A CV doesn&apos;t get you hired. It gets you the
            conversation. That&apos;s the goal.
          </p>
        </div>
      </section>

      <CVUploadModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
}
