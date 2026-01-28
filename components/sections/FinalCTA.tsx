"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CVUploadModal } from "@/components/ui/CVUploadModal";

export function FinalCTA() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  return (
    <>
      <section id="free-audit" className="py-16 md:py-24 px-4 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
            Final CTA{" "}
            <span className="text-muted-foreground font-normal text-xl">
              (soft, helpful close)
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-navy-light mb-8">
            If you&apos;re tired of applying and getting ghosted, send it over.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-coral hover:bg-coral-dark text-white px-10 py-6 text-xl rounded-full shadow-warm transition-all hover:scale-105"
            >
              <Link href="/form">Start your CV Revamp</Link>
            </Button>

            <span className="text-muted-foreground">or</span>

            <Button
              onClick={() => setIsAuditModalOpen(true)}
              variant="outline"
              size="lg"
              className="border-coral text-coral hover:bg-coral/5 px-8 py-6 text-lg rounded-full"
            >
              Free quick audit
            </Button>
          </div>
        </div>
      </section>

      <CVUploadModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
}
